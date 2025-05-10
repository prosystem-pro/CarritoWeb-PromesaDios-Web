//Librerías
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
//Modelos
import { PortadaOtro } from '../../../Modelos/PortadaOtro';
import { Otro } from '../../../Modelos/Otro';
//Servicios
import { PortadaOtroServicio } from '../../../Servicios/PortadaOtroServicio';
import { EmpresaServicio } from '../../../Servicios/EmpresaServicio';
import { OtroServicio } from '../../../Servicios/OtroServicio';
import { PermisoServicio } from '../../../Autorizacion/AutorizacionPermiso';
import { Entorno } from '../../../Entornos/Entorno';


@Component({
  selector: 'app-otro',
  imports: [CommonModule,FormsModule],
  templateUrl: './otro.component.html',
  styleUrl: './otro.component.css'
})
export class OtroComponent {
  private Url = `${Entorno.ApiUrl}`;
  private NombreEmpresa = `${Entorno.NombreEmpresa}`;
  PortadaOtro: PortadaOtro | null = null;
  Otro: Otro[] = [];
  MostrarPortadaOtro: boolean = false;
  MostrarListado: boolean[] = [];
  MostrarAgregarOtro: boolean = false;
  UrlImagenTemporal: string | ArrayBuffer | null = null;
  CodigoTemporal: string | ArrayBuffer | null = null;


    constructor(
      public PortadaOtroServicio: PortadaOtroServicio,
      public EmpresaServicio: EmpresaServicio,
      public OtroServicio: OtroServicio,
      public Permiso: PermisoServicio,
      private http: HttpClient,
      private sanitizer: DomSanitizer,
    ) {}

    ngOnInit(): void {
      this.ObtenerPortadaOtro();
      this.ObtenerOtro();
    }
//CODIGO DE PORTADA OTRO
    ObtenerPortadaOtro(): void {
  this.PortadaOtroServicio.Listado().subscribe({
    next: (data: PortadaOtro[]) => {
      if (data && data.length > 0) {
        this.PortadaOtro = data[0];
      } else {
        this.PortadaOtro = {
          NombrePortadaOtro: 'Coloca un título',
          ColorNombrePortadaOtro: '#000000',
          ColorFondoNombrePortadaOtro: '#ffffff',
          Descripcion: 'Descripción predeterminada...',
          ColorDescripcion: '#000000',
          ColorDescripcionOtro: '#ffffff',
        };
      }
    },
    error: () => {
      this.PortadaOtro = {
        NombrePortadaOtro: 'Título predeterminado',
        ColorNombrePortadaOtro: '#000000',
        ColorFondoNombrePortadaOtro: '#ffffff',
        Descripcion: 'Coloca una descripción...',
        ColorDescripcion: '#000000',
        ColorDescripcionOtro: '#ffffff',
      };
    }
  });
    }
    
    GuardarPortadaOtro(): void {
      if (!this.PortadaOtro?.CodigoPortadaOtro) {
        this.EmpresaServicio.Listado().subscribe({
          next: (empresas: any[]) => {
            if (empresas && empresas.length > 0) {
              const CodigoEmpresa = empresas[0].CodigoEmpresa;
              this.PortadaOtro!.CodigoEmpresa = CodigoEmpresa;
              this.PortadaOtroServicio.Crear(this.PortadaOtro).subscribe({
                next: () => {
                  this.ObtenerPortadaOtro();
                  this.MostrarPortadaOtro = false;
                },
                error: (error) => {
                  console.error('Error al crear el registro de PortadaOtro:', error);
                }
              });
            } else {
              console.error('No se encontraron empresas para asignar el CódigoEmpresa');
            }
          },
          error: (error) => {
            console.error('Error al obtener el CódigoEmpresa desde el servicio:', error);
          }
        });
        return;
      }
    
      this.PortadaOtroServicio.Editar(this.PortadaOtro).subscribe({
        next: () => {
          this.MostrarPortadaOtro = false;
          this.ObtenerPortadaOtro();
        },
        error: (error) => {
          console.error('Error al guardar los datos en el backend:', error);
        }
      });
    }




//CODIGO DE OTRO

  ngAfterViewChecked(): void {
  this.Otro.forEach((item, index) => {
    if (this.MostrarListado[index]) {
      const editor = document.getElementById(`editor-${index}`);
      if (editor && editor.innerHTML.trim() === '') {
        editor.innerHTML = item.Descripcion || '';
      }
    }
  });
}

ObtenerOtro(): void {
  this.OtroServicio.Listado().subscribe({
    next: (data: Otro[]) => {
      if (data && data.length > 0) {
        this.Otro = data.map(item => ({
          ...item,
          MostrarOtro: false
        }));
        this.MostrarListado = new Array(this.Otro.length).fill(false);
      } else {
        this.Otro = [];
        this.MostrarListado = [];
      }
    },
    error: () => {
      this.Otro = [];
      this.MostrarListado = [];
    }
  });
}

getSafeHtml(html: string): SafeHtml {
  return this.sanitizer.bypassSecurityTrustHtml(html);
}

// GuardarOtro(index: number): void {
//   const item = { ...this.Otro[index] };

//   const editorId = `editor-${index}`;
//   const editor = document.getElementById(editorId);
//   if (editor) {
//     item.Descripcion = editor.innerHTML;
//   }

//   delete item.UrlImagen;

//   this.OtroServicio.Editar(item).subscribe({
//     next: () => {
//       this.MostrarListado[index] = false;
//       this.ObtenerOtro();
//     },
//     error: (error) => {
//       console.error('❌ Error al guardar el item:', error);
//     }
//   });
// }

GuardarOtro(index: number | null): void {
  console.log('📥 Iniciando GuardarOtro con index:', index);
  let item: any;

  if (index !== null) {
    console.log('✏️ Modo edición con índice:', index);
    item = { ...this.Otro[index] };

    const editorId = `editor-${index}`;
    const editor = document.getElementById(editorId);
    if (editor) {
      item.Descripcion = editor.innerHTML;
      console.log('📝 Descripción capturada (edición):', item.Descripcion);
    } else {
      console.warn('⚠️ No se encontró el editor con ID:', editorId);
    }

  } else {
    console.log('🆕 Modo nuevo item (index null)');
    item = { ...this.Otro }; // Usamos el objeto temporal completo

    // Capturar contenido del editor nuevo
    const editor = document.getElementById('editor-nuevo');
    if (editor) {
      item.Descripcion = editor.innerHTML;
      console.log('📝 Descripción capturada (nuevo):', item.Descripcion);
    } else {
      console.warn('⚠️ No se encontró el editor con ID: editor-nuevo');
    }

    if (this.CodigoTemporal) {
      item.CodigoOtro = this.CodigoTemporal;
      console.log('🔁 Editando con CodigoTemporal:', this.CodigoTemporal);
    } else {
      console.log('🆕 Creando nuevo item (sin CodigoTemporal)');
    }
  }

  delete item.UrlImagen;
  console.log('📤 Objeto final listo para enviar:', item);

  if (index !== null || (this.CodigoTemporal && this.CodigoTemporal !== '')) {
    console.log('🚀 Enviando a servicio EDITAR');
    this.OtroServicio.Editar(item).subscribe({
      next: () => {
        console.log('✅ Edición exitosa');
        this.MostrarAgregarOtro = false;
        this.ObtenerOtro();
        if (index !== null) {
        }
      },
      error: (error) => {
        console.error('❌ Error al editar el item:', error);
      }
    });
  } else {
    console.log('🚀 Enviando a servicio CREAR');
    this.OtroServicio.Crear(item).subscribe({
      next: () => {
        console.log('✅ Creación exitosa');
        this.UrlImagenTemporal = '';
        this.CodigoTemporal = '';
        this.MostrarAgregarOtro = false;
        this.ObtenerOtro();
      },
      error: (error) => {
        console.error('❌ Error al crear el item:', error);
      }
    });
  }
}




FormatoTexto(comando: string, valor?: string): void {
  document.execCommand(comando, false, valor);
}
CambiarTamanoTexto(event: Event): void {
  const valor = (event.target as HTMLSelectElement).value;
  this.FormatoTexto('fontSize', valor);
}




ActualizarImagenOtro(event: any, index: number | null, permiso: string | null = null): void {
  const file: File = event.target.files[0];
  if (file) {
    this.subirImagen(file, 'UrlImagen', index, permiso);
  }
}


subirImagen(file: File, CampoDestino: string, index: number | null, permiso: string | null): void {
  const nombreEmpresa = this.NombreEmpresa ?? 'defaultCompanyName';

  console.log('📤 Iniciando subida de imagen...');
  this.EmpresaServicio.ConseguirPrimeraEmpresa().subscribe({
    next: (empresa) => {
      if (!empresa) {
        alert('No se encontró ninguna empresa.');
        return;
      }

      const formData = new FormData();
      const CodigoOtro = index != null ? String(this.Otro[index]?.CodigoOtro ?? '') : '';

      formData.append('Imagen', file);
      formData.append('CarpetaPrincipal', nombreEmpresa);
      formData.append('SubCarpeta', 'Otro');
      formData.append('CodigoVinculado', empresa.CodigoEmpresa.toString());
      formData.append('CodigoPropio', CodigoOtro);
      formData.append('CampoVinculado', 'CodigoEmpresa');
      formData.append('CampoPropio', 'CodigoOtro');
      formData.append('NombreCampoImagen', CampoDestino);

      console.log('🧾 Contenido de FormData antes de enviar:');
      formData.forEach((valor, clave) => {
        console.log(`${clave}:`, valor);
      });

      this.http.post(`${this.Url}subir-imagen`, formData).subscribe({
        next: (res: any) => {
          console.log('✅ Respuesta del servidor:', res);
          alert('Imagen subida correctamente.');

          const UrlImagen = res?.Entidad?.UrlImagen;
          this.UrlImagenTemporal = UrlImagen;

          const Temporal = res?.Entidad?.CodigoOtro;
          this.CodigoTemporal = Temporal;

          if (!permiso) {
            console.log('🔄 Ejecutando this.ObtenerOtro() porque permiso es null');
            this.ObtenerOtro();
          } else {
            console.log('⛔ No se ejecuta this.ObtenerOtro() porque permiso =', permiso);
          }
        },
        error: (err) => {
          console.error('❌ Error al subir la imagen:', err);
          alert('Error al subir la imagen. Intente de nuevo.');
        }
      });
    },
    error: (err) => {
      console.error('❌ Error al obtener empresa:', err);
      alert('No se pudo obtener la empresa. Intenta nuevamente.');
    }
  });
}



EliminarRedSocial(index: number) {
  const red = this.Otro[index];
  const codigo = red?.CodigoOtro;

  if (codigo === undefined) return;

  const confirmado = confirm('¿Estás seguro de que deseas eliminar esta red social?');

  if (confirmado) {
    this.OtroServicio.Eliminar(codigo).subscribe({
      next: () => {
        this.Otro.splice(index, 1);
      },
      error: () => {
        alert('Hubo un error al eliminar la red social.');
      }
    });
  }
}



}
