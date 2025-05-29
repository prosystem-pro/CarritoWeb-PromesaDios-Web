import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterServicio } from '../../Servicios/FooterServicio';
import { HttpClient } from '@angular/common/http';
import { Entorno } from '../../Entornos/Entorno';
import { ServicioCompartido } from '../../Servicios/ServicioCompartido';
import { RedSocialServicio } from '../../Servicios/RedSocialServicio';
import { AlertaServicio } from '../../Servicios/Alerta-Servicio';
import { PermisoServicio } from '../../Autorizacion/AutorizacionPermiso';
import { ReporteRedSocialServicio } from '../../Servicios/ReporteRedSocialServicio';
import { RedSocialImagenServicio } from '../../Servicios/RedSocialImagenServicio';


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
  RedSocial: any = [];

  constructor(
    private footerServicio: FooterServicio,
    private http: HttpClient,
    private servicioCompartido: ServicioCompartido,
    private redSocialServicio: RedSocialServicio,
    public Permiso: PermisoServicio,
    private alertaServicio: AlertaServicio,
    private redSocialImagenServicio: RedSocialImagenServicio,
    private ReporteRedSocialServicio: ReporteRedSocialServicio
  ) { }

  ngOnInit(): void {
    this.cargarDatosFooter();
    this.cargarRedesSociales();
  }

  ReportarRedSocial(codigo: number | undefined): void {
    if (codigo === undefined) {
      console.warn('Código de red social no definido, no se reporta');
      return;
    }

    const Datos = {
      CodigoRedSocial: codigo.toString(),
      Navegador: this.ObtenerNavegador()
    };

    this.ReporteRedSocialServicio.Crear(Datos).subscribe({
      next: (respuesta) => console.log('Red social reportada:', respuesta),
      error: (error) => console.error('Error al reportar red social:', error)
    });
  }

  ObtenerNavegador(): string {
    const AgenteUsuario = navigator.userAgent;

    if (AgenteUsuario.includes('Chrome') && !AgenteUsuario.includes('Edg')) {
      return 'Chrome';
    } else if (AgenteUsuario.includes('Firefox')) {
      return 'Firefox';
    } else if (AgenteUsuario.includes('Safari') && !AgenteUsuario.includes('Chrome')) {
      return 'Safari';
    } else if (AgenteUsuario.includes('Edg')) {
      return 'Edge';
    } else {
      return 'Desconocido';
    }
  }

  cargarRedesSociales(): void {
  this.redSocialServicio.Listado('Footer').subscribe({
    next: (data) => {
      this.RedSocial = data.filter((red: any) => red.Estatus === 1);
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
      const datosActualizados = { ...this.footerData };

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

            const datosActualizados = { ...this.footerData };

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

  // Método para actualizar imagen de red social
actualizarImagenRedSocial(event: any, codigoRedSocial: number): void {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  if (!codigoRedSocial) {
    this.alertaServicio.MostrarError('No se pudo identificar la red social');
    return;
  }

  // Buscar la red social específica
  const redSocial = this.RedSocial.find((red: any) => red.CodigoRedSocial === codigoRedSocial);
  if (!redSocial) {
    this.alertaServicio.MostrarError('Red social no encontrada');
    return;
  }

  // Mostrar preview inmediato
  const reader = new FileReader();
  reader.onload = (e: any) => {
    // Si ya tiene imágenes, actualizar la primera
    if (redSocial.Imagenes && redSocial.Imagenes.length > 0) {
      redSocial.Imagenes[0].UrlImagen = e.target.result;
    } else {
      // Si no tiene imágenes, crear el array y agregar una imagen temporal
      redSocial.Imagenes = [{
        CodigoRedSocialImagen: null,
        UrlImagen: e.target.result,
        Ubicacion: 'Footer'
      }];
    }
  };
  reader.readAsDataURL(file);

  // Subir la imagen al servidor
  this.subirImagenRedSocial(file, codigoRedSocial, redSocial);
}

subirImagenRedSocial(file: File, codigoRedSocial: number, redSocial: any): void {
  const formData = new FormData();
  formData.append('Imagen', file);
  formData.append('CarpetaPrincipal', this.NombreEmpresa);
  formData.append('SubCarpeta', 'RedSocialImagen');
  formData.append('CodigoVinculado', codigoRedSocial.toString());
  
  // Verificar si ya existe una imagen para esta red social en Footer
  const imagenExistente = redSocial.Imagenes?.find((img: any) => img.Ubicacion === 'Footer');
  const tieneImagenValida = imagenExistente && imagenExistente.CodigoRedSocialImagen;

  if (tieneImagenValida) {
    // Si ya existe con código válido, usar para actualización
    formData.append('CodigoPropio', imagenExistente.CodigoRedSocialImagen.toString());
  } else {
    // Si no existe o no tiene código, dejar vacío para creación
    formData.append('CodigoPropio', '');
  }

  formData.append('CampoVinculado', 'CodigoRedSocial');
  formData.append('CampoPropio', 'CodigoRedSocialImagen');
  formData.append('NombreCampoImagen', 'UrlImagen');

  this.http.post(`${this.Url}subir-imagen`, formData)
    .subscribe({
      next: (response: any) => {
        if (response && response.Entidad && response.Entidad.UrlImagen) {
          // Procesar la respuesta según si se creó o actualizó
          this.procesarRespuestaImagen(codigoRedSocial, response, redSocial);
        } else {
          // Manejar respuesta alternativa
          const imageUrl = response.UrlImagenPortada || 
                          response.url || 
                          (response.Entidad ? response.Entidad.UrlImagenPortada : null);

          if (imageUrl) {
            this.procesarRespuestaImagen(codigoRedSocial, { Entidad: { UrlImagen: imageUrl } }, redSocial);
          } else {
            this.alertaServicio.MostrarError('Error al obtener la URL de la imagen');
          }
        }
      },
      error: (error) => {
        this.alertaServicio.MostrarError('Error al subir la imagen');
        // Recargar las redes sociales para revertir el preview
        this.cargarRedesSociales();
      }
    });
}

procesarRespuestaImagen(codigoRedSocial: number, response: any, redSocial: any): void {
  const urlImagen = response.Entidad.UrlImagen;
  
  // Verificar si ya existe una imagen para esta red social en Footer
  const imagenExistente = redSocial.Imagenes?.find((img: any) => img.Ubicacion === 'Footer');

  if (imagenExistente && imagenExistente.CodigoRedSocialImagen) {
    // ACTUALIZAR: Ya existe una imagen con código válido en Footer
    this.actualizarRegistroRedSocialImagen(imagenExistente.CodigoRedSocialImagen, urlImagen);
  } else {
    // ACTUALIZAR EL REGISTRO CREADO AUTOMÁTICAMENTE: 
    // El endpoint subir-imagen ya creó un registro, solo necesitamos actualizarlo con la Ubicacion
    const codigoImagenCreada = response.Entidad.CodigoRedSocialImagen;
    
    if (codigoImagenCreada) {
      this.actualizarRegistroRedSocialImagen(codigoImagenCreada, urlImagen);
    } else {
      // Fallback: crear manualmente solo si no se creó automáticamente
      this.crearRegistroRedSocialImagen(codigoRedSocial, urlImagen);
    }
  }
}

crearRegistroRedSocialImagen(codigoRedSocial: number, urlImagen: string): void {
  const datosNuevos = {
    CodigoRedSocial: codigoRedSocial,
    UrlImagen: urlImagen,
    Ubicacion: 'Footer', // Valor quemado como solicitaste
    Estatus: 1 // Agregar estatus activo
  };

  this.redSocialImagenServicio.Crear(datosNuevos).subscribe({
    next: (response) => {
      this.alertaServicio.MostrarExito('Imagen de red social creada correctamente');
      // Recargar las redes sociales para obtener los datos actualizados
      this.cargarRedesSociales();
    },
    error: (error) => {
      this.alertaServicio.MostrarError('Error al crear la imagen de la red social');
      // Recargar las redes sociales para revertir cambios
      this.cargarRedesSociales();
    }
  });
}


actualizarRegistroRedSocialImagen(codigoRedSocialImagen: number, urlImagen: string): void {
  const datosActualizados = {
    CodigoRedSocialImagen: codigoRedSocialImagen,
    UrlImagen: urlImagen,
    Ubicacion: 'Footer', // Valor quemado como solicitaste
    Estatus: 1 // Mantener estatus activo
  };

  this.redSocialImagenServicio.Editar(datosActualizados).subscribe({
    next: (response) => {
      this.alertaServicio.MostrarExito('Imagen de red social actualizada correctamente');
      
      // Recargar las redes sociales para obtener los datos actualizados
      setTimeout(() => this.cargarRedesSociales(), 500);
    },
    error: (error) => {
      this.alertaServicio.MostrarError('Error al actualizar la imagen de la red social');
      // Recargar las redes sociales para revertir cambios
      this.cargarRedesSociales();
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