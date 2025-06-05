import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpresaPortadaServicio } from '../../../Servicios/EmpresaPortadaServicio';
import { CarruselImagenServicio } from '../../../Servicios/CarruselImagnServicio';
import { HttpClient } from '@angular/common/http';
import { Entorno } from '../../../Entornos/Entorno';
import { CarruselComponent } from '../../../Componentes/carrusel/carrusel.component';
import { CarruselServicio } from '../../../Servicios/CarruselServicio';
import { ServicioCompartido } from '../../../Servicios/ServicioCompartido';
import { PermisoServicio } from '../../../Autorizacion/AutorizacionPermiso';
import { AlertaServicio } from '../../../Servicios/Alerta-Servicio';

@Component({
  selector: 'app-nosotros',
  imports: [CommonModule, NgIf, FormsModule, CarruselComponent],
  templateUrl: './nosotros.component.html',
  styleUrls: ['./nosotros.component.css'],
  standalone: true,
})
export class NosotrosComponent implements OnInit {
  rawYoutubeUrl: string = '';
  sanitizedVideoUrl!: SafeResourceUrl;
  isVideoPlaying = false;
  videoId: string = '';

  // Nuevas propiedades para manejo de edición
  portadaData: any = null;
  carruselData: any = null;
  codigoCarrusel: number = 0;
  detallesCarrusel: any = null;
  titulo: string = '';
  isLoading = true;
  error = false;
  modoEdicion: boolean = false;
  datosOriginales: any = null;
  colorFooter: string = '';
  datosListos: boolean = false;
  private Url = `${Entorno.ApiUrl}`;
  private NombreEmpresa = `${Entorno.NombreEmpresa}`;

  constructor(
    private sanitizer: DomSanitizer,
    private empresaPortadaServicio: EmpresaPortadaServicio,
    private carruselServicio: CarruselServicio,
    private carruselImagenServicio: CarruselImagenServicio,
    private http: HttpClient,
    public Permiso: PermisoServicio,
    private alertaServicio: AlertaServicio,
    private servicioCompartido: ServicioCompartido
  ) { }

  ngOnInit(): void {
    // this.checkScreenSize();
    this.playVideo();
    this.playVideo();
    this.playVideo();
    this.setSanitizedUrl();
    this.cargarDatosPortada();
    this.cargarDatosCarrusel();
    this.servicioCompartido.colorFooter$.subscribe((color) => {
      this.colorFooter = color;
    });
  }

  // Método para cargar los datos de la portada
  cargarDatosPortada(): void {
    // El ID 11 está quemado como se mencionó en tu ejemplo
    this.empresaPortadaServicio.Listado().subscribe({
      next: (data) => {
        this.portadaData = data[0];
        this.isLoading = false;

        // Actualizar la URL del video si viene de la API
        if (this.portadaData.Urlvideo) {
          this.rawYoutubeUrl = this.portadaData.Urlvideo;

          this.setSanitizedUrl();
        }
      },
      error: (err) => {
        console.error('Error al obtener datos de la portada:', err);
        this.error = true;
        this.isLoading = false;
      },
    });
  }

  cargarDatosCarrusel(): void {
    this.carruselServicio.Listado().subscribe({
      next: (data) => {
        this.carruselData = data[0] || [];
        this.codigoCarrusel = this.carruselData.CodigoCarrusel;
        this.titulo = this.carruselData.NombreCarrusel;

        // Ahora llamamos a ListadoCarrusel usando el código obtenido
        if (this.carruselData?.CodigoCarrusel) {
          this.carruselImagenServicio
            .ListadoCarrusel(this.carruselData.CodigoCarrusel)
            .subscribe({
              next: (data) => {
                this.detallesCarrusel = data;
                this.datosListos = true;
              },
              error: (err) => {
                this.detallesCarrusel = [];
                this.datosListos = true;
                console.error('Error al obtener detalles del carrusel:', err);
              },
            });
        }
      },
      error: (err) => {
        console.error('Error al obtener datos de la portada:', err);
        this.error = true;
        this.isLoading = false;
      },
    });
  }

  // Método para activar/desactivar el modo edición
  toggleModoEdicion(): void {
    if (!this.modoEdicion) {
      // Hacer una copia profunda de los datos antes de entrar en modo edición
      this.datosOriginales = JSON.parse(JSON.stringify(this.portadaData));
      this.modoEdicion = true;
      document.body.classList.add('modoEdicion');
    } else {
      // Confirmar si desea guardar los cambios usando el servicio
      this.alertaServicio
        .Confirmacion('¿Desea guardar los cambios?')
        .then((confirmado) => {
          if (confirmado) {
            this.guardarCambios();
          } else {
            // Restaurar datos originales si cancela
            this.portadaData = JSON.parse(JSON.stringify(this.datosOriginales));
          }

          // Salir del modo edición solo después de decidir
          this.modoEdicion = false;
          document.body.classList.remove('modoEdicion');
        });
    }
  }

  // Método para guardar los cambios
  guardarCambios(): void {
    if (this.portadaData) {
      const datosActualizados = { ...this.portadaData };

      this.empresaPortadaServicio.Editar(datosActualizados).subscribe({
        next: (response) => {
          this.alertaServicio.MostrarExito('Cambios guardados correctamente');
          this.modoEdicion = false;
          document.body.classList.remove('modoEdicion');
          this.datosOriginales = null;
        },
        error: (error) => {
          this.alertaServicio.MostrarError(error, 'Error al guardar los cambios. Por favor, intente de nuevo.');
        },
      });
    } else {
      console.error('No hay datos disponibles para actualizar');
    }
  }

  // Métodos para actualizar imágenes
  actualizarImagenPortada(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagen(file, 'UrlImagenPortada');
    }
  }

  actualizarImagenPortadaIzquierda(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagen(file, 'UrlImagenPortadaIzquierdo');
    }
  }

  actualizarImagenPortadaDerecha(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagen(file, 'UrlImagenPortadaDerecho');
    }
  }

  actualizarImagenMision(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagen(file, 'UrlImagenMision');
    }
  }

  actualizarImagenVision(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagen(file, 'UrlImagenVision');
    }
  }

  // Método general para subir imágenes
  subirImagen(file: File, campoDestino: string): void {
    const formData = new FormData();
    formData.append('Imagen', file);
    formData.append('CarpetaPrincipal', this.NombreEmpresa);
    formData.append('SubCarpeta', 'EmpresaPortada');
    formData.append('CodigoVinculado', this.portadaData.CodigoEmpresa);
    formData.append('CodigoPropio', this.portadaData.CodigoEmpresaPortada);
    formData.append('CampoVinculado', 'CodigoEmpresa');
    formData.append('CampoPropio', 'CodigoEmpresaPortada');
    formData.append('NombreCampoImagen', campoDestino);

    this.http.post(`${this.Url}subir-imagen`, formData).subscribe({
      next: (response: any) => {

        if (response && response.Entidad && response.Entidad[campoDestino]) {
          this.portadaData[campoDestino] = response.Entidad[campoDestino];

          const datosActualizados = { ...this.portadaData };

          this.empresaPortadaServicio.Editar(datosActualizados).subscribe({
            next: (updateResponse) => {
              this.alertaServicio.MostrarExito(
                'Campo de imagen actualizado correctamente'
              );
              this.modoEdicion = false;
            },
            error: (updateError) => {
              this.alertaServicio.MostrarError(
                updateError,
                'Error al actualizar el campo de imagen. Por favor, intente de nuevo.'
              );
            },
          });
        }
      },
      error: (error) => {
        this.alertaServicio.MostrarError(
          error,
          'Error al subir la imagen. Por favor, intente de nuevo.'
        );
      },
    });
  }

  // Método para actualizar la URL del video
  actualizarVideo(): void {
    if (this.portadaData) {
      this.portadaData.Urlvideo = this.rawYoutubeUrl;

      this.setSanitizedUrl();
    }
  }

  // extractVideoId(): void {
  //   const match = this.rawYoutubeUrl.match(
  //     /(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/
  //   );
  //   this.videoId = match ? match[1] : '';
  // }

  // setSanitizedUrl(): void {
  //   const embedUrl = `https://www.youtube.com/embed/${this.videoId}?autoplay=1&rel=0&mute=1`;
  //   this.sanitizedVideoUrl =
  //     this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  // }

  // get videoThumbnailUrl(): string {
  //   return `https://img.youtube.com/vi/${this.videoId}/maxresdefault.jpg`;
  // }

  // playVideo(): void {
  //   this.isVideoPlaying = true;
  //   this.actualizarVideo();
  // }


  setSanitizedUrl(): void {
    this.sanitizedVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawYoutubeUrl);
  }


  playVideo(): void {
    this.isVideoPlaying = true;
    this.setSanitizedUrl();
  }
}