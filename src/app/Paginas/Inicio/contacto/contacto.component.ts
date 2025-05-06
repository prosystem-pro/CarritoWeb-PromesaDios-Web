import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { ContactanosPortada } from '../../../Modelos/ContactanosPortada';
import { RedSocial } from '../../../Modelos/RedSocial';
import { Entorno } from '../../../Entornos/Entorno';

import { PermisoServicio } from '../../../Autorizacion/AutorizacionPermiso';
import { RedSocialServicio } from '../../../Servicios/RedSocialServicio';
import { EmpresaServicio } from '../../../Servicios/EmpresaServicio';
import { ContactanosPortadaServicio } from '../../../Servicios/ContactanosPortadaServicio';

@Component({
  selector: 'app-contacto',
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})

export class ContactoComponent implements OnInit {
  private Url = `${Entorno.ApiUrl}`;
  private NombreEmpresa = `${Entorno.NombreEmpresa}`;

  ContactanosPortada!: ContactanosPortada;

  MapaSeguro!: SafeResourceUrl;
  RedeSocial: RedSocial[] = [];

  MostrarTitulo: boolean = false; 
  MostrarListado: boolean[] = [];
  MostrarCrearRedSocial: boolean = false;
  MostrarMapa: boolean =false;

  CodigoTemporal: string | null = null;
  ImagenTemporal: string | null = null;
  MapaTemporal: string = '';



  constructor(
    private ServicioContactanosPortada: ContactanosPortadaServicio,
    public Permiso: PermisoServicio,
    private http: HttpClient,
    private EmpresaServicio: EmpresaServicio,
    private RedSocialServicio: RedSocialServicio,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.ObtenerContactanosPortada();
    this.ObtenerRedesSociales();
  }
  SanitizarMapa(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

// Código relaciona al Contacto
ObtenerContactanosPortada(): void {
  this.ServicioContactanosPortada.Listado().subscribe({
    next: (data) => {
      if (data && data.length > 0) {
        this.ContactanosPortada = data[0];
        this.ContactanosPortada.NombreContactanosPortada = this.ContactanosPortada.NombreContactanosPortada || 'Nombre por defecto';
        this.ContactanosPortada.ColorFondoNombreContactanosPortada = this.ContactanosPortada.ColorFondoNombreContactanosPortada || '#f0f0f0';
        this.ContactanosPortada.ColorContornoNombreContactanosPortada = this.ContactanosPortada.ColorContornoNombreContactanosPortada || '#cccccc';
        this.ContactanosPortada.ColorNombreContactanosPortada = this.ContactanosPortada.ColorNombreContactanosPortada || '#000000';
        this.MapaSeguro = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.ContactanosPortada.UrlMapa || 'https://www.google.com/maps/embed?...'
        );

        if (this.ContactanosPortada?.UrlImagenContactanosPortada) {
          this.ContactanosPortada.UrlImagenContactanosPortada = encodeURI(this.ContactanosPortada.UrlImagenContactanosPortada);
        }

        this.ContactanosPortada.TextoComoLlegar = this.ContactanosPortada.TextoComoLlegar || 'COMO LLEGAR';
        this.ContactanosPortada.ColorTextoComoLlegar = this.ContactanosPortada.ColorTextoComoLlegar || '#ffffff';
        this.ContactanosPortada.ColorBotonComoLlegar = this.ContactanosPortada.ColorBotonComoLlegar || '#007bff';
        this.ContactanosPortada.UrlMapaComoLlegar = this.ContactanosPortada.UrlMapaComoLlegar || 'https://maps.google.com';

      } else {
        this.ContactanosPortada = {
          NombreContactanosPortada: 'Nombre por defecto',
          ColorFondoNombreContactanosPortada: '#f0f0f0',
          ColorContornoNombreContactanosPortada: '#cccccc',
          ColorNombreContactanosPortada: '#000000',
          UrlImagenContactanosPortada: '',
          UrlMapa: '',
          TextoComoLlegar: 'COMO LLEGAR',
          ColorTextoComoLlegar: '#ffffff',
          ColorBotonComoLlegar: '#007bff',
          UrlMapaComoLlegar: 'https://maps.google.com'
        };
      }
    },
    error: (error) => {
      console.error('Error al obtener contactos:', error);
    }
  });
}

GuardarContactanosPortada(): void {
  const textoMapa = this.ContactanosPortada.UrlMapa || '';

  if (textoMapa) {
    if (!textoMapa.startsWith('https://')) {
      alert('Por favor, introduce una URL válida que comience con "https://".');
      return;
    }
    const urlBase = textoMapa.split('"')[0];
    const terminaMal = /[>'"iframe\s]$/.test(urlBase);
    if (terminaMal) {
      alert('La URL no debe terminar con >, comillas o "iframe".');
      return;
    }

    this.ContactanosPortada.UrlMapa = textoMapa.trim();
  } else {
    delete this.ContactanosPortada.UrlMapa;
  }

  delete this.ContactanosPortada.UrlImagenContactanosPortada;

  Object.keys(this.ContactanosPortada).forEach(key => {
    const valor = (this.ContactanosPortada as any)[key];
    if (valor === '' || valor === null || valor === undefined) {
      delete (this.ContactanosPortada as any)[key];
    }
  });

  const esEdicion = this.ContactanosPortada.CodigoContactanosPortada;

  if (esEdicion) {
    this.ServicioContactanosPortada.Editar(this.ContactanosPortada).subscribe({
      next: () => {
        this.MostrarTitulo = false;
        alert('Los datos de la portada se editaron correctamente.');
        this.ObtenerContactanosPortada();
      },
      error: () => {
        alert('Hubo un error al editar los datos. Por favor, intente de nuevo.');
      }
    });
  } else {
    this.ServicioContactanosPortada.Crear(this.ContactanosPortada).subscribe({
      next: () => {
        this.MostrarTitulo = false;
        alert('La portada se guardó correctamente.');
        this.ObtenerContactanosPortada();
      },
      error: () => {
        alert('Hubo un error al guardar los datos. Por favor, intente de nuevo.');
      }
    });
  }
}

ActualizarImagenContactanosPortada(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.subirImagen(file, 'UrlImagenContactanosPortada');
  } else {
    console.error('No se seleccionó un archivo.');
  }
}

subirImagen(file: File, CampoDestino: string): void {
  const nombreEmpresa = this.NombreEmpresa ?? 'defaultCompanyName'; 
  this.EmpresaServicio.ConseguirPrimeraEmpresa().subscribe({
    next: (empresa) => {

      if (!empresa) {
        alert('No se encontró ninguna empresa.');
        return;  
      }
      const formData = new FormData();
      const CodigoContactanosPortada = (this.ContactanosPortada?.CodigoContactanosPortada ?? '').toString();

      formData.append('Imagen', file);
      formData.append('CarpetaPrincipal', nombreEmpresa);
      formData.append('SubCarpeta', 'ContactanosPortada');
      formData.append('CodigoVinculado', empresa.CodigoEmpresa.toString());
      formData.append('CodigoPropio', CodigoContactanosPortada);
      formData.append('CampoVinculado', 'CodigoEmpresa');
      formData.append('CampoPropio', 'CodigoContactanosPortada');
      formData.append('NombreCampoImagen', CampoDestino);

      this.http.post(`${this.Url}subir-imagen`, formData).subscribe({
        next: (res) => {
          alert('Imagen subida correctamente.');
          this.ObtenerContactanosPortada();
        },
        error: (err) => {
          console.error('Error al subir la imagen:', err);
          alert('Error al subir la imagen. Por favor, intente de nuevo.');
        }
      });
    },
    error: (err) => {
      console.error('No se pudo obtener la empresa. Intenta nuevamente.', err);
      alert('No se pudo obtener la empresa. Intenta nuevamente.');
    }
  });

}

//Código relacionado a Redes Sociales
ObtenerRedesSociales(): void {
  this.RedSocialServicio.Listado().subscribe({
    next: (data: RedSocial[]) => {
      this.RedeSocial = data;
    },
    error: (error) => {
      console.error('Error al obtener redes sociales:', error);
    }
  });
}

EditarRedSocial(index: number): void {
  const redEditada = this.RedeSocial[index];

  if (!redEditada || !redEditada.NombreRedSocial || !redEditada.Link) {
    alert('Debe completar todos los campos antes de guardar.');
    return;
  }

  delete redEditada.UrlImagen;

  this.RedSocialServicio.Editar(redEditada).subscribe({
    next: () => {
      alert('Red social actualizada correctamente.');
      this.MostrarListado[index] = false;
      this.ObtenerRedesSociales();
    },
    error: (err) => {
      alert('Hubo un error al guardar los cambios.');
    }
  });
}

CrearRedSocial(nombre: string, link: string) {
  if (!nombre.trim() || !link.trim()) return;
  const Datos = {
    NombreRedSocial: nombre,
    Link: link,
    CodigoRedSocial: this.CodigoTemporal ?? null
  };

  if (this.CodigoTemporal) {
    this.RedSocialServicio.Editar(Datos).subscribe({
      next: () => {
        this.ObtenerRedesSociales();
        this.CodigoTemporal = null;
        this.ImagenTemporal = null;
      },
      error: (error) => {
        console.error('Error al editar la red social:', error);
      }
    });
  } else {
    this.RedSocialServicio.Crear(Datos).subscribe({
      next: () => {
        this.ObtenerRedesSociales();
        this.ImagenTemporal = null;
      },
      error: (error) => {
        console.error('Error al crear la red social:', error);
      }
    });
  }
}
ActualizarImagenRedSocial(event: any, index: number | null): void {
  const file = event.target.files[0];
  if (!file) return;

  if (index !== null && this.RedeSocial[index]) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.RedeSocial[index].UrlImagen = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  this.subirImagenRedSocial(file, index);
}

subirImagenRedSocial(file: File, index: number | null): void {
  this.EmpresaServicio.ConseguirPrimeraEmpresa().subscribe({
    next: (empresa) => {
      if (!empresa) {
        alert('No se encontró ninguna empresa.');
        return;
      }

      const red = index !== null && this.RedeSocial[index]
        ? this.RedeSocial[index]
        : { CodigoRedSocial: '' };

        const CodigoRedSocialActual = red.CodigoRedSocial?.toString() || '';
        const EsEdicion = !!CodigoRedSocialActual;


      const formData = new FormData();
      formData.append('Imagen', file);
      formData.append('CarpetaPrincipal', this.NombreEmpresa);
      formData.append('SubCarpeta', 'RedSocial');
      formData.append('CodigoVinculado', empresa.CodigoEmpresa);
      formData.append('CodigoPropio', String(red.CodigoRedSocial || ''));
      formData.append('CampoVinculado', 'CodigoEmpresa');
      formData.append('CampoPropio', 'CodigoRedSocial');
      formData.append('NombreCampoImagen', 'UrlImagen');

      this.http.post(`${this.Url}subir-imagen`, formData).subscribe({
        next: (res: any) => {
          alert('Imagen de red social actualizada correctamente.');

          const urlImagen = res?.Entidad?.UrlImagen;
          this.ImagenTemporal = urlImagen;

          if (!EsEdicion && res?.Entidad?.CodigoRedSocial) {
            const NuevoCodigo = res.Entidad.CodigoRedSocial;
            this.CodigoTemporal = NuevoCodigo;
          }

        },
        error: () => {
          alert('Error al subir la imagen. Intente de nuevo.');
        }
      });
    },
    error: () => {
      alert('No se pudo obtener la empresa. Intenta nuevamente.');
    }
  });
}

EliminarRedSocial(index: number) {
  const red = this.RedeSocial[index];
  const codigo = red?.CodigoRedSocial;

  if (codigo === undefined) return;

  const confirmado = confirm('¿Estás seguro de que deseas eliminar esta red social?');

  if (confirmado) {
    this.RedSocialServicio.Eliminar(codigo).subscribe({
      next: () => {
        this.RedeSocial.splice(index, 1);
      },
      error: () => {
        alert('Hubo un error al eliminar la red social.');
      }
    });
  }
}

}

