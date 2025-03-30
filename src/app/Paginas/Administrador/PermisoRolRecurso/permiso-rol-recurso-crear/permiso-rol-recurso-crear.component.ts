import { Component } from '@angular/core';
import { PermisoRolRecursoServicio } from '../../../../Servicios/PermisoRolRecursoServicio';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../Menu/sidebar/sidebar.component';
import { NavbarComponent } from '../../Menu/navbar/navbar.component';

import { Rol } from '../../../../Modelos/Rol';
import { Permiso } from '../../../../Modelos/Permiso';
import { Recurso } from '../../../../Modelos/Recurso';
import { RolServicio } from '../../../../Servicios/RolServicio';
import { PermisoServicio } from '../../../../Servicios/PermisoServicio';
import { RecursoServicio } from '../../../../Servicios/RecursoServicio';

@Component({
  selector: 'app-permiso-rol-recurso-crear',
  imports: [FormsModule,CommonModule,SidebarComponent,NavbarComponent],
  templateUrl: './permiso-rol-recurso-crear.component.html',
  styleUrl: './permiso-rol-recurso-crear.component.css'
})
export class PermisoRolRecursoCrearComponent {
  Datos = {
    CodigoRol: '',
    CodigoPermiso: '',
    RecursosSeleccionados: [] as number[],
    Estatus: 1
  };

  Roles: Rol[] = [];
  Permisos: Permiso[] = [];
  Recursos: Recurso[] = [];

  constructor(
    private Servicio: PermisoRolRecursoServicio,
    private ServicioRol: RolServicio,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.CargarRoles();
  }

  Crear(): void {
    if (!this.Datos.CodigoRol || !this.Datos.CodigoPermiso || this.Datos.RecursosSeleccionados.length === 0) {
      alert('Debe seleccionar un rol, un permiso y al menos un recurso.');
      return;
    }

    const totalRecursos = this.Datos.RecursosSeleccionados.length;
    let peticionesCompletadas = 0;
    let errores = 0;

    this.Datos.RecursosSeleccionados.forEach((codigoRecurso) => {
      const datosEnvio = {
        CodigoRol: Number(this.Datos.CodigoRol),
        CodigoPermiso: Number(this.Datos.CodigoPermiso),
        CodigoRecurso: codigoRecurso,
        Estatus: this.Datos.Estatus
      };

      this.Servicio.Crear(datosEnvio).subscribe({
        next: () => {
          peticionesCompletadas++;
          if (peticionesCompletadas === totalRecursos) {
            if (errores === 0) {
              alert('Registros creados con éxito');
              this.router.navigate(['/permiso-rol-recurso-listado']);
            } else {
              alert(`Algunos registros no se pudieron crear (${errores} errores).`);
            }
          }
        },
        error: () => {
          errores++;
          peticionesCompletadas++;
        }
      });
    });
  }

  CargarRoles(): void {
    this.ServicioRol.Listado().subscribe({
      next: (data) => this.Roles = data,
      error: (error) => console.error('Error al cargar roles:', error)
    });
  }

  FiltrarPermisos(): void {
    if (!this.Datos.CodigoRol) {
      this.Permisos = [];
      return;
    }

    const codigoRolSeleccionado = Number(this.Datos.CodigoRol);

    this.Servicio.ObtenerPermisos(codigoRolSeleccionado).subscribe({
      next: (data: Permiso[]) => {
        this.Permisos = data;
        this.Datos.CodigoPermiso = '';
        this.Recursos = [];
      },
      error: (error) => console.error("Error al obtener permisos:", error)
    });
  }

  FiltrarRecursos(): void {
    if (!this.Datos.CodigoPermiso) {
      this.Recursos = [];
      return;
    }

    const codigoRolSeleccionado = Number(this.Datos.CodigoRol);
    const codigoPermisoSeleccionado = Number(this.Datos.CodigoPermiso);

    this.Servicio.ObtenerRecursos(codigoRolSeleccionado, codigoPermisoSeleccionado).subscribe({
      next: (data: Recurso[]) => {
        this.Recursos = data;
        this.Datos.RecursosSeleccionados = [];
      },
      error: (error) => console.error("Error al obtener recursos:", error)
    });
  }

  ManejarSeleccionRecurso(codigoRecurso: number, event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.checked) {
      this.Datos.RecursosSeleccionados.push(codigoRecurso);
    } else {
      this.Datos.RecursosSeleccionados = this.Datos.RecursosSeleccionados.filter(r => r !== codigoRecurso);
    }
  }

  NavegarListado(ruta: string): void {
    this.router.navigate([ruta]);
  }
}
