import { Component, OnInit } from '@angular/core';
import { EmpresaServicio } from '../../../../Servicios/EmpresaServicio';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../Menu/sidebar/sidebar.component';
import { NavbarComponent } from '../../Menu/navbar/navbar.component';

@Component({
  selector: 'app-empresa-listado',
  imports: [FormsModule, CommonModule, SidebarComponent, NavbarComponent],
  templateUrl: './empresa-listado.component.html',
  styleUrl: './empresa-listado.component.css'
})
export class EmpresaListadoComponent implements OnInit {
  Datos: any[] = [];
  FiltroTexto: string = "";
  PaginaActual: number = 1;
  ElementosPorPagina: number = 8;

  constructor(private Servicio: EmpresaServicio, private router: Router) {}

  ngOnInit(): void {
    this.Listado();
  }

  Buscador(): any[] {
    return this.Datos.filter(dato =>
      dato.NombreEmpresa.toLowerCase().includes(this.FiltroTexto.toLowerCase()) ||
      dato.Direccion.toLowerCase().includes(this.FiltroTexto.toLowerCase()) ||
      dato.Eslogan.toLowerCase().includes(this.FiltroTexto.toLowerCase()) ||
      dato.Celular.toString().includes(this.FiltroTexto)
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
        console.error("Error al cargar los datos", error);
      }
    });
  }

  Eliminar(Codigo: number): void {
    if (confirm("¿Estás seguro de que deseas eliminar el registro?")) {
      this.Servicio.Eliminar(Codigo).subscribe({
        next: () => {
          alert("Registro eliminado correctamente");
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

  NavegarEditar(ruta: string, Codigo: number) {
    this.router.navigate([ruta, Codigo]);
  }
}
