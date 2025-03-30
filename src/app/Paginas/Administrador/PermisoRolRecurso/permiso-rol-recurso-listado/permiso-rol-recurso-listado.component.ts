import { Component, OnInit } from '@angular/core';
import { PermisoRolRecursoServicio } from '../../../../Servicios/PermisoRolRecursoServicio';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../Menu/sidebar/sidebar.component';
import { NavbarComponent } from '../../Menu/navbar/navbar.component';

@Component({
  selector: 'app-permiso-rol-recurso-listado',
  imports: [FormsModule, CommonModule, SidebarComponent, NavbarComponent],
  templateUrl: './permiso-rol-recurso-listado.component.html',
  styleUrl: './permiso-rol-recurso-listado.component.css'
})
export class PermisoRolRecursoListadoComponent {
  Datos: any[] = [];
  FiltroTexto: string = "";
  PaginaActual: number = 1;
  ElementosPorPagina: number = 8;

  constructor(private Servicio: PermisoRolRecursoServicio, private router: Router) {}

  ngOnInit(): void {
    this.Listado();
  }

  Buscador(): any[] {
    return this.Datos.filter(dato =>
      dato.Rol?.NombreRol.toLowerCase().includes(this.FiltroTexto.toLowerCase()) ||
      dato.Permiso?.NombrePermiso.toLowerCase().includes(this.FiltroTexto.toLowerCase()) ||
      dato.Recurso?.NombreRecurso.toLowerCase().includes(this.FiltroTexto.toLowerCase())
    );
  }

    DatosPaginados(): any[] {
      const inicio = (this.PaginaActual - 1) * this.ElementosPorPagina;
      const fin = inicio + this.ElementosPorPagina;
      return this.Buscador().slice(inicio, fin);
    }
  
    TotalPaginas(): number[] {
      const total = Math.ceil(this.Buscador().length / this.ElementosPorPagina);
      return Array(total).fill(0).map((_, i) => i + 1);
    }
  
    CambiarPagina(nuevaPagina: number): void {
      if (nuevaPagina >= 1 && nuevaPagina <= this.TotalPaginas().length) {
        this.PaginaActual = nuevaPagina;
      }
    }
  
  Listado(): void {
    this.Servicio.Listado().subscribe({
      next: (data) => {
        console.log('Datos del lsitado',data)
        this.Datos = data;
        console.log('Datos del lsitado',data)
      },
      error: (error) => {
      }
    });
  }

  
  Eliminar(CodigoRol: number,CodigoPermiso:number,CodigoRecurso:number): void {
    if (confirm("¿Estás seguro de que deseas eliminar el registro?")) {
      this.Servicio.Eliminar(CodigoRol,CodigoPermiso,CodigoRecurso).subscribe({
        next: () => {
          alert("Registro eliminada correctamente");
          this.Listado();
        },
        error: () => {
          alert("Error al eliminar el registro");
        }
      });
    }
  }

  NavegarCrear(ruta: string) {
    this.router.navigate([ruta]);
  }

}
