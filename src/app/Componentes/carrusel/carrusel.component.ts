import { Component, Input, SimpleChanges, HostListener, ElementRef, ViewChild, ChangeDetectorRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Entorno } from '../../Entornos/Entorno';
import { CarruselImagenServicio } from '../../Servicios/CarruselImagnServicio';
import { Subscription } from 'rxjs';
import { Carrusel } from '../../Modelos/Carrusel';
import { CarruselServicio } from '../../Servicios/CarruselServicio';

interface CarruselItem {
  CodigoCarruselImagen: number;
  CodigoCarrusel: number;
  UrlImagen: string;
  title?: string;
  description?: string;
  alt?: string;
}

interface ImagenEdicion {
  CodigoCarruselImagen: number;
  CodigoCarrusel: number;
  UrlImagen: string;
  imagen: File | null;
  imagenPreview: string | null;
}

interface NuevaImagen {
  id: string;
  titulo: string;
  imagen: File | string;
  imagenPreview: string | null;
}

@Component({
  selector: 'app-carrusel',
  imports: [CommonModule, FormsModule],
  templateUrl: './carrusel.component.html',
  styleUrl: './carrusel.component.css'
})
export class CarruselComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly Url = `${Entorno.ApiUrl}`;
  private readonly NombreEmpresa = `${Entorno.NombreEmpresa}`;
  @Input() items: CarruselItem[] = [];
  @Input() codigoCarrusel: number = 0;
  @Input() title: string = '¡Los productos más destacados!';
  @Input() titleClass: string = 'cursive-font text-dark';
  @Input() autoplay: boolean = false;
  @Input() autoplayInterval: number = 2000;
  
  @ViewChild('carouselContainer') carouselContainer!: ElementRef<HTMLElement>;
  
  currentIndex = 0;
  totalItems = 0;
  itemsPerView = 1;
  itemWidth = 280;
  gapWidth = 20;
  isMobile = false;
  maxScrollPosition = 0;
  shouldCenter = false;
  autoplayIntervalId?: number;
  modoEdicion = false;
  cargandoImagen = false;
  itemEnEdicion: CarruselItem | null = null;
  private subscriptions: Subscription[] = [];
  editandoTitulo: boolean = false;
  tituloTemporal: string = '';
  carruselActual: Carrusel | null = null;

  nuevaImagen: NuevaImagen = {
    id: '',
    titulo: '',
    imagen: '',
    imagenPreview: null
  };

  imagenEdicion: ImagenEdicion = {
    CodigoCarruselImagen: 0,
    CodigoCarrusel: 0,
    UrlImagen: '',
    imagen: null,
    imagenPreview: null,
  };

  constructor(
    private el: ElementRef, 
    private http: HttpClient,
    private carruselImagenServicio: CarruselImagenServicio,
    private cdr: ChangeDetectorRef,
    private carruselServicio: CarruselServicio
  ) {}
  
  ngOnInit(): void {
    this.checkScreenSize();
    if (this.codigoCarrusel > 0) {
      this.cargarDatosCarrusel();
    }
  }

  ngAfterViewInit(): void {
    // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.setupCarousel();
      
      if (this.autoplay && !this.modoEdicion) {
        // this.startAutoplay();
      }
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && !changes['items'].firstChange) {
      setTimeout(() => {
        this.setupCarousel();
      }, 100);
    }
    
    if (changes['autoplay'] && !changes['autoplay'].firstChange) {
      if (this.autoplay && !this.modoEdicion) {
        // this.startAutoplay();
      } else {
        this.stopAutoplay();
      }
    }
  }

    cargarDatosCarrusel(): void {
    this.carruselServicio.ObtenerPorCodigo(this.codigoCarrusel)
      .subscribe({
        next: (data) => {
          this.carruselActual = data;
          this.title = data.NombreCarrusel || '';
        },
        error: (error) => {
          console.error('Error al cargar datos del carrusel:', error);
        }
      });
  }

  toggleModoEdicion(): void {
    this.modoEdicion = !this.modoEdicion;
    this.cancelarEdicion();
    
    // Pausar el autoplay cuando se entra en modo edición
    if (this.modoEdicion) {
      this.stopAutoplay();
      this.resetToStart();
    } else if (this.autoplay) {
      // this.startAutoplay();
    }
    
    // Asegurar que el carrusel se actualice correctamente después de cambiar el modo
    setTimeout(() => {
      this.setupCarousel();
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    // Limpiar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
    this.setupCarousel();
  }
  
  checkScreenSize(): void {
    const prevIsMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;
    this.itemWidth = this.isMobile ? 220 : 280;
    this.itemsPerView = Math.max(1, Math.floor((window.innerWidth - 30) / (this.itemWidth + this.gapWidth)));
    
    // Si cambió el modo, actualizar el carrusel
    if (prevIsMobile !== this.isMobile) {
      setTimeout(() => this.setupCarousel(), 100);
    }
  }
  
  setupCarousel(): void {
    const carousel = this.carouselContainer?.nativeElement;
    if (!carousel) return;
    
    const leftArrow = this.el.nativeElement.querySelector('.arrow-left');
    const rightArrow = this.el.nativeElement.querySelector('.arrow-right');
    
    // Obtener todos los elementos del carrusel (incluyendo el item de edición si está presente)
    const carouselItems = carousel.querySelectorAll('.product-card');
    this.totalItems = carouselItems.length;
    
    if (carouselItems.length > 0) {
      const firstItem = carouselItems[0] as HTMLElement;
      if (firstItem.offsetWidth > 0) {
        this.itemWidth = firstItem.offsetWidth;
      }
    }
    
    const totalCarouselWidth = this.totalItems * (this.itemWidth + this.gapWidth) - this.gapWidth;
    const containerWidth = carousel.clientWidth;
    this.shouldCenter = !this.isMobile && containerWidth >= totalCarouselWidth;
    
    this.maxScrollPosition = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
    
    // Asegurarnos de que el índice actual sea válido
    this.currentIndex = Math.min(this.currentIndex, Math.max(0, this.totalItems - 1));
    
    // Actualizar la visibilidad de las flechas
    this.updateArrowsVisibility(leftArrow, rightArrow);
    
    // Distribuir los elementos según el modo de visualización
    this.distributeItems();
    
    // Remover listener existente para evitar duplicados
    carousel.removeEventListener('scroll', this.handleScroll);
    
    // Añadir listener de scroll
    carousel.addEventListener('scroll', this.handleScroll);
  }
  
  private handleScroll = () => {
    const carousel = this.carouselContainer?.nativeElement;
    if (carousel) {
      this.updateArrowsBasedOnScroll(carousel);
      
      // Actualizar el índice actual basado en el scroll
      if (!this.shouldCenter && this.totalItems > 0) {
        const scrollStep = this.itemWidth + this.gapWidth;
        this.currentIndex = Math.round(carousel.scrollLeft / scrollStep);
        this.currentIndex = Math.max(0, Math.min(this.currentIndex, this.totalItems - 1));
        this.cdr.detectChanges();
      }
    }
  };
  
  distributeItems(): void {
    const carousel = this.carouselContainer?.nativeElement;
    if (!carousel) return;
    
    if (this.isMobile) {
      carousel.classList.add('mobile-view');
      carousel.classList.remove('desktop-view');
      carousel.style.justifyContent = '';
    } else {
      carousel.classList.add('desktop-view');
      carousel.classList.remove('mobile-view');
      
      if (this.shouldCenter) {
        carousel.style.justifyContent = 'center';
      } else {
        carousel.style.justifyContent = 'flex-start';
      }
    }
  }
  
  scrollCarousel(direction: string): void {
    const carousel = this.carouselContainer?.nativeElement;
    if (!carousel || this.shouldCenter) return;
    
    const scrollStep = this.itemWidth + this.gapWidth;
    let newScrollPosition = 0;
    
    if (direction === 'left') {
      if (carousel.scrollLeft < scrollStep * 1.5) {
        newScrollPosition = 0;
      } else {
        newScrollPosition = carousel.scrollLeft - scrollStep;
      }
      
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    } else if (direction === 'right') {
      if (carousel.scrollLeft > this.maxScrollPosition - scrollStep * 1.5) {
        newScrollPosition = this.maxScrollPosition;
      } else {
        newScrollPosition = carousel.scrollLeft + scrollStep;
      }
      
      if (this.currentIndex < this.totalItems - 1) {
        this.currentIndex++;
      }
    }
    
    carousel.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });
    
    // Actualizar las flechas después del scroll
    setTimeout(() => {
      this.updateArrowsBasedOnScroll(carousel);
    }, 300);
  }
  
  updateArrowsVisibility(leftArrow: Element | null, rightArrow: Element | null): void {
    // En modo móvil o si hay pocos elementos, ocultamos las flechas
    const shouldShowArrows = !this.shouldCenter && this.totalItems > this.itemsPerView;
    
    if (leftArrow) {
      leftArrow.classList.toggle('d-none', !shouldShowArrows);
      if (shouldShowArrows) leftArrow.classList.remove('d-none');
    }
    
    if (rightArrow) {
      rightArrow.classList.toggle('d-none', !shouldShowArrows);
      if (shouldShowArrows) rightArrow.classList.remove('d-none');
    }
  }
  
  updateArrowsBasedOnScroll(carousel: HTMLElement): void {
    const leftArrow = this.el.nativeElement.querySelector('.arrow-left');
    const rightArrow = this.el.nativeElement.querySelector('.arrow-right');
    
    if (leftArrow) {
      leftArrow.style.opacity = carousel.scrollLeft <= 10 ? '0.5' : '1';
    }
    
    if (rightArrow) {
      rightArrow.style.opacity = carousel.scrollLeft >= this.maxScrollPosition - 10 ? '0.5' : '1';
    }
  }
  
  startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayIntervalId = window.setInterval(() => {
      if (this.currentIndex < this.totalItems - 1) {
        this.scrollCarousel('right');
      } else {
        this.resetToStart();
      }
    }, this.autoplayInterval);
  }
  
  stopAutoplay(): void {
    if (this.autoplayIntervalId) {
      clearInterval(this.autoplayIntervalId);
      this.autoplayIntervalId = undefined;
    }
  }
  
  resetToStart(): void {
    const carousel = this.carouselContainer?.nativeElement;
    if (!carousel) return;
    
    carousel.scrollTo({
      left: 0,
      behavior: 'smooth'
    });
    
    this.currentIndex = 0;
    this.updateArrowsBasedOnScroll(carousel);
  }
  
  getIndicatorClass(index: number): string {
    return this.currentIndex === index ? 'active' : '';
  }
  
  goToSlide(index: number): void {
    const carousel = this.carouselContainer?.nativeElement;
    if (!carousel) return;
    
    const scrollStep = this.itemWidth + this.gapWidth;
    const newScrollPosition = index * scrollStep;
    
    carousel.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });
    
    this.currentIndex = index;
    this.updateArrowsBasedOnScroll(carousel);
  }

  resetNuevaImagen(): void {
    this.nuevaImagen = {
      id: '',
      titulo: '',
      imagen: '',
      imagenPreview: null
    };
  }
  
  guardarNuevoImagen(): void {
    if (this.nuevaImagen.imagen && typeof this.nuevaImagen.imagen !== 'string') {
      this.subirImagenCarrusel();
    }
  }

  seleccionarImagenNuevo(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.nuevaImagen.imagen = file;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.nuevaImagen.imagenPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  subirImagenCarrusel(): void {
    if (!this.nuevaImagen.imagen || typeof this.nuevaImagen.imagen === 'string') {
      console.error('No hay archivo para subir');
      return;
    }

    this.cargandoImagen = true;

    const formData = new FormData();
    formData.append('Imagen', this.nuevaImagen.imagen);
    formData.append('CarpetaPrincipal', this.NombreEmpresa);
    formData.append('SubCarpeta', 'CarruselImagen');
    formData.append('CodigoVinculado', this.codigoCarrusel.toString());
    formData.append('CodigoPropio', '');
    formData.append('CampoVinculado', 'CodigoCarrusel');
    formData.append('CampoPropio', 'CodigoCarruselImagen');
    formData.append('NombreCampoImagen', 'UrlImagen');

    const subscription = this.http.post(`${this.Url}subir-imagen`, formData)
      .subscribe({
        next: (response: any) => {
          console.log('Imagen subida correctamente', response);
          this.cargandoImagen = false;

          // Crear un nuevo objeto para añadir al carrusel
          const nuevaImagenCarrusel: CarruselItem = {
            UrlImagen: response.Entidad?.UrlImagen || response.url,
            CodigoCarruselImagen: response.Entidad?.CodigoCarruselImagen || 0,
            CodigoCarrusel: this.items[0]?.CodigoCarrusel || this.codigoCarrusel
          };

          // Añadir la nueva imagen al array de items
          this.items = [...this.items, nuevaImagenCarrusel];
          
          // Reiniciar el formulario de nueva imagen
          this.resetNuevaImagen();
          
          // Actualizar el carrusel
          setTimeout(() => {
            this.setupCarousel();
            this.cdr.detectChanges();
          }, 100);
        },
        error: (error) => {
          console.error('Error al subir la imagen', error);
          alert('Error al subir la imagen. Por favor, intente de nuevo.');
          this.cargandoImagen = false;
          this.cdr.detectChanges();
        }
      });
    
    this.subscriptions.push(subscription);
  }
  
  // ---- MÉTODOS PARA EDICIÓN Y ELIMINACIÓN ----
  
  // Iniciar edición de una imagen existente
  iniciarEdicion(item: CarruselItem): void {
    // Evitar múltiples ediciones simultáneas
    if (this.itemEnEdicion !== null) {
      this.cancelarEdicion();
    }
    
    // Guardar referencia al ítem en edición
    this.itemEnEdicion = item;
    
    // Inicializar objeto de edición
    this.imagenEdicion = {
      CodigoCarruselImagen: item.CodigoCarruselImagen || 0,
      CodigoCarrusel: item.CodigoCarrusel || this.items[0]?.CodigoCarrusel || 0,
      UrlImagen: item.UrlImagen || '',
      imagen: null,
      imagenPreview: item.UrlImagen || null,
    };
  }
  
  // Cancelar la edición actual
  cancelarEdicion(): void {
    this.itemEnEdicion = null;
    this.imagenEdicion = {
      CodigoCarruselImagen: 0,
      CodigoCarrusel: 0,
      UrlImagen: '',
      imagen: null,
      imagenPreview: null,
    };
  }
  
  // Seleccionar nueva imagen para edición
  seleccionarImagenEdicion(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      this.imagenEdicion.imagen = file;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagenEdicion.imagenPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Guardar los cambios de edición
  guardarEdicion(): void {
    // Si hay una nueva imagen seleccionada, subirla
    if (this.imagenEdicion.imagen) {
      this.actualizarImagenCarrusel();
    }
  }
  
  // Actualizar imagen en el servidor
  actualizarImagenCarrusel(): void {
    if (!this.imagenEdicion.imagen) {
      console.error('No hay archivo para actualizar');
      return;
    }
    
    this.cargandoImagen = true;
    
    const formData = new FormData();
    formData.append('Imagen', this.imagenEdicion.imagen);
    formData.append('CarpetaPrincipal', this.NombreEmpresa);
    formData.append('SubCarpeta', 'CarruselImagen');
    formData.append('CodigoVinculado', this.imagenEdicion.CodigoCarrusel.toString());
    formData.append('CodigoPropio', this.imagenEdicion.CodigoCarruselImagen.toString());
    formData.append('CampoVinculado', 'CodigoCarrusel');
    formData.append('CampoPropio', 'CodigoCarruselImagen');
    formData.append('NombreCampoImagen', 'UrlImagen');
    
    const subscription = this.http.post(`${this.Url}subir-imagen`, formData)
      .subscribe({
        next: (response: any) => {
          console.log('Imagen actualizada correctamente', response);
          this.cargandoImagen = false;
          
          // Actualizar el ítem en el array
          if (this.itemEnEdicion) {
            const index = this.items.findIndex((item: CarruselItem) => 
              item.CodigoCarruselImagen === this.imagenEdicion.CodigoCarruselImagen);
            
            if (index !== -1) {
              // Actualizar URL de imagen y otros metadatos
              this.items[index].UrlImagen = response.Entidad?.UrlImagen || response.url;
              // Crear un nuevo array para forzar la detección de cambios
              this.items = [...this.items];
            }
          }
          
          // Resetear edición
          this.cancelarEdicion();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al actualizar la imagen', error);
          alert('Error al actualizar la imagen. Por favor, intente de nuevo.');
          this.cargandoImagen = false;
          this.cdr.detectChanges();
        }
      });
    
    this.subscriptions.push(subscription);
  }
    
  // Eliminar una imagen del carrusel
  eliminarImagen(item: CarruselItem): void {
    if (confirm('¿Está seguro que desea eliminar esta imagen?')) {
      const codigoCarruselImagen = item.CodigoCarruselImagen;
      
      const subscription = this.carruselImagenServicio.Eliminar(codigoCarruselImagen).subscribe({
        next: (response) => {
          console.log('Imagen eliminada correctamente', response);
          
          // Eliminar el ítem del array local
          this.items = this.items.filter((img: CarruselItem) => 
            img.CodigoCarruselImagen !== codigoCarruselImagen);
          
          // Actualizar el carrusel
          setTimeout(() => {
            this.setupCarousel();
            this.cdr.detectChanges();
          }, 100);
        },
        error: (error) => {
          console.error('Error al eliminar la imagen', error);
          alert('Error al eliminar la imagen. Por favor, intente de nuevo.');
        }
      });
      
      this.subscriptions.push(subscription);
    }
  }
  
  // Verificar si un ítem está en edición
  esItemEnEdicion(item: CarruselItem): boolean {
    return !!this.itemEnEdicion && this.itemEnEdicion.CodigoCarruselImagen === item.CodigoCarruselImagen;
  }

    activarEdicionTitulo(): void {
    this.tituloTemporal = this.title;
    this.editandoTitulo = true;
  }

  guardarTitulo(): void {
    if (!this.carruselActual) {
      console.error('No hay un carrusel cargado para editar');
      return;
    }

    this.carruselActual.NombreCarrusel = this.tituloTemporal;
    
    this.carruselServicio.Editar(this.carruselActual)
      .subscribe({
        next: (response) => {
          this.title = this.tituloTemporal;
          this.editandoTitulo = false;
          console.log('Título actualizado con éxito:', response);
        },
        error: (error) => {
          console.error('Error al actualizar el título:', error);
          // Opcional: mostrar un mensaje de error al usuario
        }
      });
  }

  cancelarEdicionTitulo(): void {
    this.editandoTitulo = false;
    this.tituloTemporal = '';
  }
}