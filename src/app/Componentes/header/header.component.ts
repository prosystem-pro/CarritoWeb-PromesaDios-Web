import { Component, ElementRef, Renderer2, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarEstiloServicio } from '../../Servicios/NavbarEstiloServicio';
import { NgStyle, CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Entorno } from '../../Entornos/Entorno';
import { ServicioCompartido } from '../../Servicios/ServicioCompartido';
import { Subscription } from 'rxjs';
import { CarritoComponent } from '../carrito/carrito.component';
import { RedSocialServicio } from '../../Servicios/RedSocialServicio';
import { RedSocial } from '../../Modelos/RedSocial';

@Component({
  selector: 'app-header',
  imports: [NgStyle, CommonModule, FormsModule, NgIf, CarritoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: true,
})
export class HeaderComponent implements OnInit, OnDestroy {
  private Url = `${Entorno.ApiUrl}`;
  private NombreEmpresa = `${Entorno.NombreEmpresa}`;
  private subscription!: Subscription;
  primaryColor: string = '';
  Datos: any = null;
  modoEdicion: boolean = false;
  datosOriginales: any = null;
  textoBusqueda: string = '';
  busquedaActiva: boolean = false;
  totalItemsCarrito: number = 0;
  mostrarCarrito = false;
  RedeSocial: RedSocial[] = [];
  @ViewChild('navbarCollapse') navbarCollapse!: ElementRef;

  constructor(
    private Servicio: NavbarEstiloServicio,
    private router: Router,
    private http: HttpClient,
    private renderer: Renderer2,
    private servicioCompartido: ServicioCompartido,
    private redSocialServicio: RedSocialServicio
  ) {}

  ngOnInit(): void {
    this.Listado();
    this.cargarRedesSociales();
    this.subscription = this.servicioCompartido.carritoVaciado$.subscribe(() => {
      this.obtenerTotalItemsCarrito();
    });
    this.obtenerTotalItemsCarrito();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  cargarRedesSociales(): void {
    this.redSocialServicio.Listado().subscribe({
      next: (data: RedSocial[]) => {
        this.RedeSocial = data;
        console.log('Redes sociales cargadas:', this.RedeSocial);
      },
      error: (error) => {
        console.error('Error al obtener redes sociales:', error);
      }
    });
  }

  buscar(): void {
    // Verifica que haya texto de búsqueda antes de hacer la solicitud
    if (this.textoBusqueda.trim()) {
      this.servicioCompartido.setTextoBusqueda(this.textoBusqueda); // Actualiza el texto de búsqueda
      this.busquedaActiva = true;
    }
  }

  cancelarBusqueda(): void {
    // Verifica que haya texto de búsqueda antes de hacer la solicitud
    if (this.textoBusqueda.trim()) {
      this.servicioCompartido.setTextoBusqueda(""); // Actualiza el texto de búsqueda
      this.busquedaActiva = false;
      this.textoBusqueda = "";
    }
  }

  obtenerTotalItemsCarrito(): void {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      const carrito = JSON.parse(carritoGuardado);
      const totalItems = carrito.reduce((total: number, item: any) => total + (item.cantidad || 1), 0);
      this.totalItemsCarrito = totalItems;
    } else {
      this.totalItemsCarrito = 0;
    }
  }

  toggleModoEdicion(): void {
    if (!this.modoEdicion) {
      // Hacer una copia profunda de los datos antes de entrar en modo edición
      this.datosOriginales = JSON.parse(JSON.stringify(this.Datos));
      this.modoEdicion = true;
      document.body.classList.add('modoEdicion');
    } else {
      // Preguntar si desea guardar los cambios
      if (confirm('¿Desea guardar los cambios?')) {
        this.guardarCambios();
      } else {
        // Restaurar datos originales si cancela
        this.Datos = JSON.parse(JSON.stringify(this.datosOriginales));
        this.actualizarEstilosCSS();
      }
      this.modoEdicion = false;
      document.body.classList.remove('modoEdicion');
    }
  }

  sincronizarColores(): void {
    if (this.Datos && this.Datos.length > 0) {
      const colorSeleccionado = this.Datos.ColorTextoInicio;
      this.Datos.ColorTextoMenu = colorSeleccionado;
      this.Datos.ColorTextoContacto = colorSeleccionado;
    }
  }

  guardarCambios(): void {
    if (this.Datos) {
      const datosActualizados = { ...this.Datos };

      datosActualizados.ColorTextoMenu = datosActualizados.ColorTextoInicio;
      datosActualizados.ColorTextoContacto = datosActualizados.ColorTextoInicio;

      this.Servicio.Editar(datosActualizados).subscribe({
        next: (response) => {
          alert('Cambios guardados correctamente');
          this.modoEdicion = false;
          document.body.classList.remove('modoEdicion');
          this.datosOriginales = null;
        },
        error: (error) => {
          console.error('Error al guardar los cambios', error);
          alert('Error al guardar los cambios. Por favor, intente de nuevo.');
        },
      });
    } else {
      console.error('No hay datos disponibles para actualizar');
    }
  }

  Listado(): void {
    this.Servicio.Listado().subscribe({
      next: (data) => {
        this.Datos = data[0];
        this.actualizarEstilosCSS();
        this.servicioCompartido.setDatosHeader({
          urlImagenCarrito: this.Datos.UrlImagenCarrito,
          textoBuscador: this.Datos.TextoBuscador,
          urlImagenLupa: this.Datos.UrlImagenBuscador,
        }
        );
      },
      error: (error) => {
        console.error('Error al cargar los datos', error);
      },
    });
  }

  actualizarEstilosCSS(): void {
    document.documentElement.style.setProperty(
      '--color-fondo-buscador',
      this.Datos?.ColorFondoBuscador || '#f0f0f0'
    );
    document.documentElement.style.setProperty(
      '--color-texto-buscador',
      this.Datos?.ColorTextoBuscador || '#000'
    );
    document.documentElement.style.setProperty(
      '--color-fondo-navbar',
      this.Datos?.ColorFondoNavbar || 'white'
    );
    document.documentElement.style.setProperty(
      '--url-imagen-buscador',
      `url(${this.Datos?.UrlImagenBuscador})`
    );
  }

  actualizarEstilosBuscador(): void {
    document.documentElement.style.setProperty(
      '--color-fondo-buscador',
      this.Datos?.ColorFondoBuscador || '#f0f0f0'
    );
    document.documentElement.style.setProperty(
      '--color-texto-buscador',
      this.Datos?.ColorTextoBuscador || '#000'
    );
  }

  actualizarLogo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.Datos.UrlLogo = e.target.result;
      };
      reader.readAsDataURL(file);

      this.subirImagen(file, 'UrlLogo');
    }
  }

  actualizarImagenBuscador(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.Datos.UrlImagenBuscador = e.target.result;
        document.documentElement.style.setProperty(
          '--url-imagen-buscador',
          `url(${e.target.result})`
        );
      };
      reader.readAsDataURL(file);

      this.subirImagen(file, 'UrlImagenBuscador');
    }
  }

  actualizarImagenCarrito(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.Datos.UrlImagenCarrito = e.target.result;
      };
      reader.readAsDataURL(file);

      this.subirImagen(file, 'UrlImagenCarrito');
    }
  }

  subirImagen(file: File, campoDestino: string): void {
    const formData = new FormData();
    formData.append('Imagen', file);
    formData.append('CarpetaPrincipal', this.NombreEmpresa);
    formData.append('SubCarpeta', 'Navbar');
    formData.append('CodigoVinculado', this.Datos.CodigoEmpresa);
    formData.append('CodigoPropio', this.Datos.CodigoNavbar);
    formData.append('CampoVinculado', 'CodigoEmpresa');
    formData.append('CampoPropio', 'CodigoNavbar');
    formData.append('NombreCampoImagen', campoDestino);

    this.http.post(`${this.Url}subir-imagen`, formData).subscribe({
      next: (response: any) => {
        alert('Cargando imagen...');
        console.log('Imagen subida correctamente', response);

        if (response && response.Entidad && response.Entidad[campoDestino]) {
          this.Datos[campoDestino] = response.Entidad[campoDestino];

          if (campoDestino === 'UrlImagenBuscador') {
            document.documentElement.style.setProperty(
              '--url-imagen-buscador',
              `url(${response.Entidad[campoDestino]})`
            );
          }

          const datosActualizados = { ...this.Datos };

          this.Servicio.Editar(datosActualizados).subscribe({
            next: (updateResponse) => {
              console.log(
                'Campo de imagen actualizado en el modelo Navbar',
                updateResponse
              );
              this.modoEdicion = false;
            },
            error: (updateError) => {
              console.error(
                'Error al actualizar el campo de imagen en el modelo Navbar',
                updateError
              );
            },
          });
        } else {
          const imageUrl =
            response.UrlImagenPortada ||
            response.url ||
            (response.Entidad ? response.Entidad.UrlImagenPortada : null);

          if (imageUrl) {
            this.Datos[campoDestino] = imageUrl;
            console.log(
              `URL de imagen actualizada: ${campoDestino} = ${imageUrl}`
            );
          } else {
            console.warn(
              'No se pudo obtener la URL de la imagen de la respuesta',
              response
            );
          }
        }
      },
      error: (error) => {
        console.error('Error al subir la imagen', error);
        alert('Error al subir la imagen. Por favor, intente de nuevo.');
      },
    });
  }

  cerrarNavbarSiEsMovil() {
    if (window.innerWidth < 992) {
      // 992px = Bootstrap breakpoint for lg
      const el = this.navbarCollapse.nativeElement;
      this.renderer.removeClass(el, 'show'); // Cierra el menú colapsado
    }
  }

  navegar(ruta: string) {
    this.cerrarNavbarSiEsMovil();
    this.router.navigate([ruta]);
  }

  estaRutaActiva(ruta: string): boolean {
    return this.router.url === ruta || this.router.url.startsWith(ruta + '/');
  }

  openColorPicker(): void {
    const colorInput = document.getElementById(
      'colorPicker'
    ) as HTMLInputElement;
    colorInput.click();
  }

  changeColor(event: Event): void {
    const color = (event.target as HTMLInputElement).value;

    // Actualizar la propiedad CSS para cambio visual inmediato
    document.documentElement.style.setProperty('--color-fondo-navbar', color);

    // Actualizar el objeto local Datos
    if (this.Datos) {
      this.Datos.ColorFondoNavbar = color;
    } else {
      console.error('No hay datos disponibles para actualizar');
    }
  }

    //Método para ver el carrito
  alternarCarrito() {
    this.mostrarCarrito = !this.mostrarCarrito;
  }

  cerrarSesion() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('colorClasificacion');
    localStorage.removeItem('colorClasificacionTexto');
    this.router.navigate(['/login']);
  }
}
