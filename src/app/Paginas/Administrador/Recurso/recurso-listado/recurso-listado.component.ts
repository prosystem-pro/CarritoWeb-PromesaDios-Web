import { Component, OnInit } from '@angular/core';
import { RecursoServicio } from '../../../../Servicios/RecursoServicio';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../Menu/sidebar/sidebar.component';
import { NavbarComponent } from '../../Menu/navbar/navbar.component';


@Component({
  selector: 'app-recurso-listado',
  imports: [SidebarComponent,NavbarComponent,FormsModule,CommonModule],
  templateUrl: './recurso-listado.component.html',
  styleUrl: './recurso-listado.component.css'
})
export class RecursoListadoComponent {
  Datos: any[] = [];
  FiltroTexto: string = "";
  PaginaActual: number = 1;
  ElementosPorPagina: number = 8;

  constructor(private Servicio: RecursoServicio, private router: Router) {}

  ngOnInit(): void {
    this.Listado();
  }

  Buscador(): any[] {
    return this.Datos.filter(dato =>
      dato.NombreRecurso.toLowerCase().includes(this.FiltroTexto.toLowerCase()) 
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
