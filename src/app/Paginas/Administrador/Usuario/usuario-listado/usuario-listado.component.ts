import { Component, OnInit } from '@angular/core';
import { UsuarioServicio } from '../../../../Servicios/UsuarioServicio';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../Menu/sidebar/sidebar.component';
import { NavbarComponent } from '../../Menu/navbar/navbar.component';

import { Usuario } from '../../../../Modelos/Usuario';
import { Rol } from '../../../../Modelos/Rol';
import { Empresa } from '../../../../Modelos/Empresa';
import { RolServicio } from '../../../../Servicios/RolServicio';
import { EmpresaServicio } from '../../../../Servicios/EmpresaServicio';

@Component({
  selector: 'app-usuario-listado',
  imports: [FormsModule, CommonModule, SidebarComponent, NavbarComponent],
  templateUrl: './usuario-listado.component.html',
  styleUrl: './usuario-listado.component.css'
})
export class UsuarioListadoComponent implements OnInit {
  Datos: { 
    CodigoUsuario: number; 
    NombreUsuario: string; 
    CodigoRol: number; 
    CodigoEmpresa: number; 
    Estatus: number; 
    NombreRol?: string; 
    NombreEmpresa?: string; 
  }[] = [];
  Roles: { [key: number]: string } = {};
  Empresas: { [key: number]: string } = {}; 
  FiltroTexto: string = "";
  PaginaActual: number = 1;
  ElementosPorPagina: number = 8;

  constructor(private Servicio: UsuarioServicio,
    private ServicioRol: RolServicio,
    private ServicioEmpresa: EmpresaServicio,
    private router: Router) {}

  ngOnInit(): void {
    this.CargarRoles();
    this.CargarEmpresas();
    this.Listado();
  }
  Buscador(): any[] {
    return this.Datos.filter(dato =>
      dato.NombreUsuario.toLowerCase().includes(this.FiltroTexto.toLowerCase()) ||
      dato.CodigoRol.toString().includes(this.FiltroTexto)||
      dato.CodigoEmpresa.toString().includes(this.FiltroTexto)||
      dato.NombreRol?.toLowerCase().includes(this.FiltroTexto.toLowerCase()) ||
      dato.NombreEmpresa?.toLowerCase().includes(this.FiltroTexto.toLowerCase()) 
      
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
      next: (data: any[]) => { 
        this.Datos = data.map((item: any) => ({
          ...item,  
          NombreRol: this.Roles[item.CodigoRol] || "Desconocido",
          NombreEmpresa: this.Empresas[item.CodigoEmpresa] || "Desconocida" 
        }));
      },
      error: (error) => {
        console.error("Error al obtener el listado de datos", error);
      }
    });
  }
  

  CargarRoles(): void {
    this.ServicioRol.Listado().subscribe({
      next: (data: Rol[]) => {
        this.Roles = data.reduce((acc: { [key: number]: string }, rol: Rol) => {
          acc[rol.CodigoRol] = rol.NombreRol;
          return acc;
        }, {});
        this.Listado();
      },
      error: (error) => {
        console.error("Error al cargar roles", error);
      }
    });
  }

  CargarEmpresas(): void {
    this.ServicioEmpresa.Listado().subscribe({
      next: (data: Empresa[]) => {
        this.Empresas = data.reduce((acc: { [key: number]: string }, empresa: Empresa) => {
          acc[empresa.CodigoEmpresa] = empresa.NombreEmpresa;
          return acc;
        }, {});
        this.Listado();
      },
      error: (error) => {
        console.error("Error al cargar empresas", error);
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
