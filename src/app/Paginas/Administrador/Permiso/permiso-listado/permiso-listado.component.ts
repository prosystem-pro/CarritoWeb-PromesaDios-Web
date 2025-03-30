import { Component, OnInit } from '@angular/core';
import { PermisoServicio } from '../../../../Servicios/PermisoServicio';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../Menu/sidebar/sidebar.component';
import { NavbarComponent } from '../../Menu/navbar/navbar.component';

@Component({
  selector: 'app-permiso-listado',
  imports: [FormsModule, CommonModule, SidebarComponent, NavbarComponent],
  templateUrl: './permiso-listado.component.html',
  styleUrl: './permiso-listado.component.css'
})
export class PermisoListadoComponent implements OnInit {
  Datos: any[] = [];
  FiltroTexto: string = "";
  PaginaActual: number = 1;
  ElementosPorPagina: number = 8;

  constructor(private Servicio: PermisoServicio, private router: Router) {}

  ngOnInit(): void {
    this.Listado();
  }

  Buscador(): any[] {
    return this.Datos.filter(dato =>
      dato.NombrePermiso.toLowerCase().includes(this.FiltroTexto.toLowerCase())
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
        this.Datos = data;
      },
      error: (error) => {
      }
    });
  }

  Eliminar(Codigo: number): void {
    if (confirm("¿Estás seguro de que deseas eliminar el registro?")) {
      this.Servicio.Eliminar(Codigo).subscribe({
        next: () => {
          alert("Registro eliminada correctamente");
          this.Listado();
        },
        error: () => {
          alert("Registro al eliminar la empresa");
        }
      });
    }
  }

  NavegarCrear(ruta: string) {
    this.router.navigate([ruta]);
  }

  NavegarEditar(ruta: string, Codigo: number) {
    this.router.navigate([ruta, Codigo]);
  }
}
