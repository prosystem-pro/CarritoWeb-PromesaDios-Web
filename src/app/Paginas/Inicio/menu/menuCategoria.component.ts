import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClasificacionProductoServicio } from '../../../Servicios/ClasificacionProductoServicio';
import { MenuPortadaServicio } from '../../../Servicios/MenuPortadaServicio';
import { HttpClient } from '@angular/common/http';
import { Entorno } from '../../../Entornos/Entorno';
import { Subscription } from 'rxjs';
import { CarruselImagenServicio } from '../../../Servicios/CarruselImagnServicio';
import { CarruselComponent } from '../../../Componentes/carrusel/carrusel.component';
import { CarruselServicio } from '../../../Servicios/CarruselServicio';
import { SvgDecoradorComponent } from '../../../Componentes/svg-decorador/svg-decorador.component';
import { Router } from '@angular/router';
import { ServicioCompartido } from '../../../Servicios/ServicioCompartido';
import { EmpresaServicio } from '../../../Servicios/EmpresaServicio';
import { AlertaServicio } from '../../../Servicios/Alerta-Servicio';
import { PermisoServicio } from '../../../Autorizacion/AutorizacionPermiso';

@Component({
  selector: 'app-menuCategoria',
  imports: [NgFor, NgIf, FormsModule, CommonModule, CarruselComponent, SvgDecoradorComponent],
  templateUrl: './menuCategoria.component.html',
  styleUrl: './menuCategoria.component.css',
})
export class MenuCategoriaComponent implements OnInit {
  private Url = `${Entorno.ApiUrl}`;
  private NombreEmpresa = `${Entorno.NombreEmpresa}`;
  private textoBusquedaSubscription!: Subscription;

  modoEdicion = false;
  mostrarPanelColor = false;
  menuPortada: any = null;
  clasificaciones: any[] = [];
  clasificacionesOriginales: any[] = [];
  tituloPrincipal: string = '';
  editandoTituloPrincipal: boolean = false;
  tituloPrincipalOriginal: string = '';
  tituloPrincipalTemporal: string = '';
  editandoTitulo: number | null = null;
  tituloOriginal: string = '';
  tituloTemporal: string = '';
  carruselData: any = null;
  detallesCarrusel: any = null;
  titulo: string = ''
  codigoCarrusel: number = 0;
  datosListos: boolean = false;
  empresaData: any = null;
  codigoEmpresa: number = 0;

  nuevaCategoria = {
    titulo: '',
    imagenFile: null as File | null,
    imagenPreview: null,
  };

  isLoading = true;
  error = false;

  coloresPredefinidos = [
    '#ff9500', //Default
    '#3498db', // Azul cielo
    '#2ecc71', // Verde esmeralda
    '#e74c3c', // Rojo coral
    '#f39c12', // Naranja ámbar
    '#9b59b6', // Púrpura amatista
    '#34495e', // Azul oscuro grisáceo
    '#ffffff', // Blanco
  ];

  constructor(
    private clasificacionProductoServicio: ClasificacionProductoServicio,
    private carruselServicio: CarruselServicio,
    private carruselImagenServicio: CarruselImagenServicio,
    private menuPortadaServicio: MenuPortadaServicio,
    private router: Router,
    private servicioCompartido: ServicioCompartido,
    private empresaServicio: EmpresaServicio,
    private alertaServicio: AlertaServicio,
    public Permiso: PermisoServicio,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.cargarMenuPortada();
    this.cargarClasificaciones();
    this.cargarDatosCarrusel();
    this.cargarDataEmpresa();
  }

  ngOnDestroy(): void {
    // Limpiamos la suscripción cuando el componente se destruye
    if (this.textoBusquedaSubscription) {
      this.textoBusquedaSubscription.unsubscribe();
    }
  }

  toggleColorPanel(): void {
    this.mostrarPanelColor = !this.mostrarPanelColor;
  }

  cargarMenuPortada(): void {
    this.menuPortadaServicio.Listado().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.menuPortada = data[0];
          // Actualizar el título principal
          this.tituloPrincipal =
            this.menuPortada.TituloMenu || '';
            this.servicioCompartido.setDatosClasificacion({
              colorClasificacionFondo: this.menuPortada?.ColorFondoNombreClasificacion || '',
              colorClasificacionTexto: this.menuPortada?.ColorNombreClasificacion || '',
            });
        } else {
          console.warn('No se encontraron datos de MenuPortada');
          this.inicializarMenuPortadaSiNoExiste();
        }
      },
      error: (err) => {
        console.error('Error al obtener MenuPortada:', err);
        this.inicializarMenuPortadaSiNoExiste();
      },
    });
  }

  cargarClasificaciones(): void {
    this.isLoading = true;
    this.clasificacionProductoServicio.Listado().subscribe({
      next: (data: any[]) => {
        // Filtrar clasificaciones con nombres nulos o vacíos
        this.clasificaciones = data.filter(
          (item) =>
            item.NombreClasificacionProducto &&
            item.NombreClasificacionProducto.trim() !== '' &&
            item.CodigoClasificacionProducto !== 0
        );
        this.clasificacionesOriginales = [...this.clasificaciones];

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener clasificaciones:', err);
        this.error = true;
        this.isLoading = false;
      },
    });
  }

  cargarDatosCarrusel(): void {
    this.carruselServicio.Listado().subscribe({
      next: (data) => {
        this.carruselData = data[1] || [];
        this.codigoCarrusel = this.carruselData.CodigoCarrusel;
        this.titulo = this.carruselData.NombreCarrusel;

        // Ahora llamamos a ListadoCarrusel usando el código obtenido
        if (this.carruselData?.CodigoCarrusel) {
          this.carruselImagenServicio.ListadoCarrusel(this.carruselData.CodigoCarrusel).subscribe({
            next: (data) => {
              this.detallesCarrusel = data;
              this.datosListos = true;
            },
            error: (err) => {
              this.detallesCarrusel = [];
              this.datosListos = true;
              console.error('Error al obtener detalles del carrusel:', err);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error al obtener datos de la portada:', err);
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  cargarDataEmpresa(): void {
    this.empresaServicio.Listado().subscribe({
      next: (data) => {
        this.empresaData = data[0];
        this.codigoEmpresa = this.empresaData.CodigoEmpresa;
      },
      error: (err) => {
        console.error('Error al obtener datos de la empresa:', err);
      }
    });
  }

  toggleModoEdicion() {
    this.modoEdicion = !this.modoEdicion;
    document.body.classList.toggle('modoEdicion', this.modoEdicion);

    // Si salimos del modo edición, cerrar el panel de colores y resetear la nueva categoría
    if (!this.modoEdicion) {
      this.mostrarPanelColor = false;
      this.resetNuevaCategoria();
    }
  }

  // Iniciar la edición del título principal
  iniciarEdicionTituloPrincipal() {
    // Guarda el título original por si se cancela
    this.tituloPrincipalOriginal = this.tituloPrincipal;

    // Activa el modo de edición para el título principal
    this.editandoTituloPrincipal = true;

    // Inicializa el valor temporal con el valor actual
    this.tituloPrincipalTemporal = this.tituloPrincipal;
  }

  // Actualiza el valor temporal mientras se edita
  onTituloPrincipalInput(evento: any) {
    this.tituloPrincipalTemporal = evento.target.textContent;
  }

  // Guarda los cambios del título principal
  guardarTituloPrincipal() {
    // Actualiza el valor del título principal
    this.tituloPrincipal = this.tituloPrincipalTemporal.trim();

    // Actualiza el título en MenuPortada
    if (this.menuPortada) {
      this.menuPortada.TituloMenu = this.tituloPrincipal;
      this.actualizarMenuPortada();
    }

    // Termina el modo de edición
    this.editandoTituloPrincipal = false;
    console.log('Título principal guardado:', this.tituloPrincipal);
  }

  // Cancela la edición y restaura el valor original
  cancelarEdicionTituloPrincipal() {
    // Restaura el valor original
    this.tituloPrincipal = this.tituloPrincipalOriginal;

    // Termina el modo de edición
    this.editandoTituloPrincipal = false;
    console.log('Edición del título principal cancelada');
  }

  // Iniciar la edición de un título
  iniciarEdicionTitulo(clasificacion: any) {
    this.tituloOriginal = clasificacion.NombreClasificacionProducto;
    this.editandoTitulo = clasificacion.CodigoClasificacionProducto;
    this.tituloTemporal = clasificacion.NombreClasificacionProducto;
  }

  // Actualiza el valor temporal mientras se edita
  onTituloInput(evento: any, clasificacion: any) {
    this.tituloTemporal = evento.target.textContent;
  }

  // Guarda los cambios del título
  guardarTituloClasificacion(clasificacion: any) {
    clasificacion.NombreClasificacionProducto = this.tituloTemporal.trim();

    this.actualizarClasificacion(clasificacion);

    this.editandoTitulo = null;
    this.alertaServicio.MostrarExito('Título guardado correctamente', 'Éxito');
  }

  // Cancela la edición y restaura el valor original
  cancelarEdicionTitulo(clasificacion: any) {
    clasificacion.NombreClasificacionProducto = this.tituloOriginal;
    const elements = document.querySelectorAll(
      '[data-id="' + clasificacion.CodigoClasificacionProducto + '"]'
    );
    if (elements.length > 0) {
      elements[0].textContent = this.tituloOriginal;
    }
    this.editandoTitulo = null;
    console.log('Edición cancelada');
  }

  // Cambia la imagen de una clasificación
  cambiarImagen(evento: any, clasificacion: any) {
    const file = evento.target.files[0];
    if (file) {
      // Mostrar preview (opcional)
      const reader = new FileReader();
      reader.onload = (e: any) => {
        clasificacion.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);

      // Subir imagen al servidor
      this.subirImagen(file, clasificacion);
    }
  }

  // Selecciona imagen para nueva categoría
  seleccionarImagenNuevaCategoria(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.nuevaCategoria.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);

      this.nuevaCategoria.imagenFile = file;
    }
  }

  actualizarImagenPortadaIzquierda(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagenDecorativo(file, 'UrlImagenPortadaIzquierdo');
    }
  }

  actualizarImagenPortadaDerecha(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagenDecorativo(file, 'UrlImagenPortadaDerecho');
    }
  }

  actualizarImagenTemporada(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.subirImagenDecorativo(file, 'UrlImagenPresentacion');
    }
  }

  subirImagenDecorativo(file: File, campoDestino: string): void {
    const formData = new FormData();
    formData.append('Imagen', file);
    formData.append('CarpetaPrincipal', this.NombreEmpresa);
    formData.append('SubCarpeta', 'MenuPortada');
    formData.append('CodigoVinculado', this.menuPortada.CodigoEmpresa);
    formData.append('CodigoPropio', this.menuPortada.CodigoMenuPortada);
    formData.append('CampoVinculado', 'CodigoEmpresa');
    formData.append('CampoPropio', 'CodigoMenuPortada');
    formData.append('NombreCampoImagen', campoDestino);

    this.http.post(`${this.Url}subir-imagen`, formData)
      .subscribe({
        next: (response: any) => {

          if (response && response.Entidad && response.Entidad[campoDestino]) {
            this.menuPortada[campoDestino] = response.Entidad[campoDestino];

            const datosActualizados = { ...this.menuPortada };

            this.menuPortadaServicio.Editar(datosActualizados).subscribe({
              next: (updateResponse) => {
                this.alertaServicio.MostrarExito('Imagen actualizada correctamente', 'Éxito');
                this.modoEdicion = false;
              },
              error: (updateError) => {
                this.alertaServicio.MostrarError(updateError, 'Error al actualizar la imagen');
              }
            });
          }
        },
        error: (error) => {
          this.alertaServicio.MostrarError(error, 'Error al subir la imagen');
        }
      });
  }

  // Crea una nueva categoría subiendo primero la imagen
  subirImagenNuevaCategoria() {
    if (this.nuevaCategoria.titulo && this.nuevaCategoria.imagenFile) {
      const formData = new FormData();
      formData.append('Imagen', this.nuevaCategoria.imagenFile);
      formData.append('CarpetaPrincipal', this.NombreEmpresa);
      formData.append('SubCarpeta', 'ClasificacionProducto');
      formData.append('CodigoVinculado', this.codigoEmpresa.toString() || '1');
      formData.append('CodigoPropio', ''); // Vacío para que el servidor cree uno nuevo
      formData.append('CampoVinculado', 'CodigoEmpresa');
      formData.append('CampoPropio', 'CodigoClasificacionProducto');
      formData.append('NombreCampoImagen', 'UrlImagen');

      // alert('Creando nueva categoría...');

      this.http.post(`${this.Url}subir-imagen`, formData).subscribe({
        next: (response: any) => {

          if (response && response.Entidad) {
            // Actualizar con el nombre de la categoría
            const nuevaClasificacion = {
              CodigoClasificacionProducto:
                response.Entidad.CodigoClasificacionProducto,
              CodigoEmpresa: 8,
              NombreClasificacionProducto: this.nuevaCategoria.titulo,
              UrlImagen: response.Entidad.UrlImagen || '',
              Estatus: 1,
            };

            this.clasificacionProductoServicio
              .Editar(nuevaClasificacion)
              .subscribe({
                next: (updateResponse) => {
                  this.alertaServicio.MostrarExito('Nueva categoría creada correctamente', 'Éxito');

                  // Recargar clasificaciones
                  this.cargarClasificaciones();

                  // Resetear formulario
                  this.resetNuevaCategoria();
                },
                error: (updateError) => {
                  this.alertaServicio.MostrarError(updateError, 'Error al crear la categoría');

                  // Recargar clasificaciones de todos modos
                  this.cargarClasificaciones();
                },
              });
          } else {
            this.alertaServicio.MostrarError('Error al procesar la respuesta del servidor', 'Error');
          }
        },
        error: (error) => {
          this.alertaServicio.MostrarError(error, 'Error al subir la imagen. Por favor, intente de nuevo.');
        },
      });
    }
  }

  // Sube una imagen y actualiza la clasificación
  subirImagen(file: File, clasificacion: any): void {
    const formData = new FormData();
    formData.append('Imagen', file);
    formData.append('CarpetaPrincipal', this.NombreEmpresa);
    formData.append('SubCarpeta', 'ClasificacionProducto');
    formData.append('CodigoVinculado', clasificacion.CodigoEmpresa.toString());
    formData.append(
      'CodigoPropio',
      clasificacion.CodigoClasificacionProducto.toString()
    );
    formData.append('CampoVinculado', 'CodigoEmpresa');
    formData.append('CampoPropio', 'CodigoClasificacionProducto');
    formData.append('NombreCampoImagen', 'UrlImagen');

    alert('Actualizando imagen...');

    this.http.post(`${this.Url}subir-imagen`, formData).subscribe({
      next: (response: any) => {
        console.log('Imagen subida correctamente', response);

        if (response && response.Entidad && response.Entidad.UrlImagen) {
          // Actualizar la URL de la imagen en la clasificación
          clasificacion.UrlImagen = response.Entidad.UrlImagen;
          alert('Imagen actualizada correctamente');
        } else {
          alert('Error al procesar la respuesta del servidor');
          console.warn('No se pudo obtener la URL de la imagen', response);

          // Recargar clasificaciones para obtener la imagen actualizada
          this.cargarClasificaciones();
        }
      },
      error: (error) => {
        console.error('Error al subir la imagen', error);
        alert('Error al subir la imagen. Por favor, intente de nuevo.');
      },
    });
  }

  // Actualiza una clasificación en el servidor
  actualizarClasificacion(clasificacion: any): void {
    this.clasificacionProductoServicio.Editar(clasificacion).subscribe({
      next: (response) => {
      },
      error: (error) => {
      },
    });
  }

  // Elimina una clasificación
  eliminarCategoria(clasificacion: any): void {
    this.alertaServicio.Confirmacion(
      '¿Estás seguro de que deseas eliminar esta categoría?',
      'Esta acción no se puede deshacer.'
    ).then((confirmado) => {
      if (confirmado) {
        this.clasificacionProductoServicio
          .Eliminar(clasificacion.CodigoClasificacionProducto)
          .subscribe({
            next: (response) => {
              this.alertaServicio.MostrarExito('Categoría eliminada correctamente');

              // Eliminar de la lista local
              const index = this.clasificaciones.findIndex(
                (c) =>
                  c.CodigoClasificacionProducto === clasificacion.CodigoClasificacionProducto
              );

              if (index !== -1) {
                this.clasificaciones.splice(index, 1);
              }
            },
            error: (error) => {
              this.alertaServicio.MostrarError(error, 'Error al eliminar la categoría');
            },
          });
      }
    });
  }

  // Resetea el formulario de nueva categoría
  resetNuevaCategoria() {
    this.nuevaCategoria = {
      titulo: '',
      imagenFile: null,
      imagenPreview: null,
    };
  }

  // Actualiza los datos de MenuPortada en el servidor
  actualizarMenuPortada(): void {
    if (this.menuPortada) {
      // Si el registro tiene CodigoMenuPortada = 0, significa que es nuevo y hay que crearlo
      if (this.menuPortada.CodigoMenuPortada === 0) {
        this.menuPortadaServicio.Crear(this.menuPortada).subscribe({
          next: (response) => {
            console.log('MenuPortada creado correctamente', response);
            // Actualizar el objeto local con el ID asignado por el servidor
            if (response && response.Entidad) {
              // this.menuPortada.CodigoMenuPortada = response.Entidad.CodigoMenuPortada;
            }
          },
          error: (error) => {
            console.error('Error al crear MenuPortada', error);
            // Intentar con CrearEditar como alternativa
            this.crearEditarMenuPortada();
          },
        });
      } else {
        // Si ya tiene ID, actualizar
        this.menuPortadaServicio.Editar(this.menuPortada).subscribe({
          next: (response) => {
            console.log('MenuPortada actualizado correctamente', response);
            this.cargarMenuPortada();
          },
          error: (error) => {
            console.error('Error al actualizar MenuPortada', error);
            // Intentar con CrearEditar como alternativa
            this.crearEditarMenuPortada();
          },
        });
      }
    }
  }

  // Usar CrearEditar como alternativa si Crear o Editar fallan
  crearEditarMenuPortada(): void {
    if (this.menuPortada) {
      this.menuPortadaServicio.CrearEditar(this.menuPortada).subscribe({
        next: (response) => {
          console.log('MenuPortada creado/actualizado correctamente', response);
          if (response && response.Entidad) {
            // this.menuPortada.CodigoMenuPortada = response.Entidad.CodigoMenuPortada;
          }
        },
        error: (error) => {
          console.error('Error al crear/actualizar MenuPortada', error);
          alert('Error al actualizar la configuración de la portada');
        },
      });
    }
  }

  // Cambia el color del contorno de las imágenes
  cambiarColorContorno(color: string): void {
    if (this.menuPortada) {
      this.menuPortada.ColorContornoImagenClasificacion = color;
      this.actualizarMenuPortada();
    }
  }

  // Cambia el color del fondo de los botones
  cambiarColorFondoBoton(color: string): void {
    if (this.menuPortada) {
      this.menuPortada.ColorFondoNombreClasificacion = color;
      this.actualizarMenuPortada();
    }
  }

  // Cambia el color del texto de los botones
  cambiarColorTextoBoton(color: string): void {
    if (this.menuPortada) {
      this.menuPortada.ColorNombreClasificacion = color;
      this.actualizarMenuPortada();
    }
  }

  // Cambia el color del título principal
  cambiarColorTitulo(color: string): void {
    if (this.menuPortada) {
      this.menuPortada.ColorTituloMenu = color;
      this.actualizarMenuPortada();
    }
  }

  // Inicializar MenuPortada si no existe
  private inicializarMenuPortadaSiNoExiste(): void {
    if (!this.menuPortada) {
      this.menuPortada = {
        CodigoMenuPortada: 0,
        CodigoEmpresa: 8,
        UrlImagenNavbar: '',
        UrlImagenPortadaIzquierdo: '',
        UrlImagenPortadaDerecho: '',
        TituloMenu: this.tituloPrincipal,
        ColorTituloMenu: '#ff9500',
        UrlImagenMenu: '',
        ColorContornoImagenClasificacion: '#ff9500',
        ColorNombreClasificacion: '#000000',
        ColorFondoNombreClasificacion: '#ff9500',
        UrlImagenPresentacion: '',
        Estatus: 1,
      };
    }
  }

  navegar(ruta: string, codigo: string, nombre: string) {
    this.router.navigate([ruta, codigo, nombre]);
  }

  onColorChange(color: string) {
    this.menuPortada.ColorFondoNombreClasificacion = color;
    this.servicioCompartido.setDatosClasificacion({
      colorClasificacionFondo: color,
      colorClasificacionTexto: this.menuPortada.ColorNombreClasificacion,
    });
  }
}
