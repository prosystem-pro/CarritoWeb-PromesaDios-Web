import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterServicio } from '../../Servicios/FooterServicio';
import { HttpClient } from '@angular/common/http';
import { Entorno } from '../../Entornos/Entorno';
import { ServicioCompartido } from '../../Servicios/ServicioCompartido';
import { RedSocialServicio } from '../../Servicios/RedSocialServicio';
import { RedSocial } from '../../Modelos/RedSocial';
import { AlertaServicio } from '../../Servicios/Alerta-Servicio';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  private Url = `${Entorno.ApiUrl}`;
  private NombreEmpresa = `${Entorno.NombreEmpresa}`;
  footerData: any = null;
  isLoading = true;
  error = false;
  modoEdicion: boolean = false;
  datosOriginales: any = null;
  RedeSocial: RedSocial[] = [];

  constructor(
    private footerServicio: FooterServicio,
    private http: HttpClient,
    private servicioCompartido: ServicioCompartido,
    private redSocialServicio: RedSocialServicio,
    private alertaServicio: AlertaServicio
  ) {}

  ngOnInit(): void {
    this.cargarDatosFooter();
    this.cargarRedesSociales();
  }

  cargarRedesSociales(): void {
    this.redSocialServicio.Listado().subscribe({
      next: (data: RedSocial[]) => {
        this.RedeSocial = data;
      },
      error: (error) => {
      }
    });
  }

  cargarDatosFooter(): void {
    // ID 2 quemado como solicitaste
    this.footerServicio.Listado().subscribe({
      next: (data) => {
        this.footerData = data[0];
        this.servicioCompartido.setColorFooter(this.footerData?.ColorFooter);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener datos del footer:', err);
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  toggleModoEdicion(): void {
    if (!this.modoEdicion) {
      // Hacer una copia profunda de los datos antes de entrar en modo edición
      this.datosOriginales = JSON.parse(JSON.stringify(this.footerData));
      this.modoEdicion = true;
      document.body.classList.add('modoEdicion');
    } else {
      // Preguntar si desea guardar los cambios
      this.alertaServicio.Confirmacion('¿Desea guardar los cambios?').then((confirmado) => {
        if (confirmado) {
          this.guardarCambios();
        } else {
          // Restaurar datos originales si cancela
          this.footerData = JSON.parse(JSON.stringify(this.datosOriginales));
          this.servicioCompartido.setColorFooter(this.footerData?.ColorFooter);
        }
      });
      this.modoEdicion = false;
      document.body.classList.remove('modoEdicion');
    }
  }

  guardarCambios(): void {
    if (this.footerData) {
      const datosActualizados = {...this.footerData};

      this.footerServicio.Editar(datosActualizados).subscribe({
        next: (response) => {
          this.alertaServicio.MostrarExito('Cambios guardados correctamente');
          this.modoEdicion = false;
          document.body.classList.remove('modoEdicion');
          this.datosOriginales = null;
        },
        error: (error) => {
          this.alertaServicio.MostrarError('Error al guardar los cambios');
        }
      });
    } else {
      this.alertaServicio.MostrarAlerta('No hay datos disponibles para actualizar');
    }
  }

  actualizarLogo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.footerData.UrlLogo = e.target.result;
      };
      reader.readAsDataURL(file);

      this.subirImagen(file, 'UrlLogo');
    }
  }

  subirImagen(file: File, campoDestino: string): void {
    const formData = new FormData();
    formData.append('Imagen', file);
    formData.append('CarpetaPrincipal', this.NombreEmpresa);
    formData.append('SubCarpeta', 'Footer');
    formData.append('CodigoVinculado', this.footerData.CodigoEmpresa);
    formData.append('CodigoPropio', this.footerData.CodigoFooter);
    formData.append('CampoVinculado', 'CodigoEmpresa');
    formData.append('CampoPropio', 'CodigoFooter');
    formData.append('NombreCampoImagen', campoDestino);

    this.http.post(`${this.Url}subir-imagen`, formData)
      .subscribe({
        next: (response: any) => {
          
          if (response && response.Entidad && response.Entidad[campoDestino]) {
            this.footerData[campoDestino] = response.Entidad[campoDestino];
            
            const datosActualizados = {...this.footerData};

            this.footerServicio.Editar(datosActualizados).subscribe({
              next: (updateResponse) => {
                this.alertaServicio.MostrarExito('Imagen actualizada correctamente');
                this.modoEdicion = false;
              },
              error: (updateError) => {
                this.alertaServicio.MostrarError('Error al actualizar la imagen');
              }
            });
          } else {
            const imageUrl = response.UrlImagenPortada || 
                           response.url || 
                           (response.Entidad ? response.Entidad.UrlImagenPortada : null);
            
            if (imageUrl) {
              this.footerData[campoDestino] = imageUrl;
            } else {
              this.alertaServicio.MostrarError('Error al obtener la URL de la imagen');
            }
          }
        },
        error: (error) => {
          this.alertaServicio.MostrarError('Error al subir la imagen');
        }
      });
  }

  sincronizarColoresTexto(): void {
    if (this.footerData) {
      const colorSeleccionado = this.footerData.ColorTextoInicio;
      this.footerData.ColorTextoMenu = colorSeleccionado;
      this.footerData.ColorTextoContacto = colorSeleccionado;
      this.footerData.ColorTextoOtro = colorSeleccionado;
    }
  }

  onColorChange(color: string) {
    this.footerData.ColorFooter = color;
    this.servicioCompartido.setColorFooter(color);//Comentario
  }
  
}