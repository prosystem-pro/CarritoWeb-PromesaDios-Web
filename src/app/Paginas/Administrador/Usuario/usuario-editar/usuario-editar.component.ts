import { Component, OnInit } from '@angular/core';
import { UsuarioServicio } from '../../../../Servicios/UsuarioServicio';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../Menu/sidebar/sidebar.component';
import { NavbarComponent } from '../../Menu/navbar/navbar.component';

import { Rol } from '../../../../Modelos/Rol';
import { Empresa } from '../../../../Modelos/Empresa';
import { RolServicio } from '../../../../Servicios/RolServicio';
import { EmpresaServicio } from '../../../../Servicios/EmpresaServicio';

@Component({
  selector: 'app-usuario-editar',
  imports: [FormsModule, CommonModule, SidebarComponent, NavbarComponent],
  templateUrl: './usuario-editar.component.html',
  styleUrl: './usuario-editar.component.css'
})
export class UsuarioEditarComponent {
  Datos: any = { 
    NombreUsuario: '', 
    Clave: '', 
    Estatus: '',
    CodigoEmpresa: '',
    CodigoRol: ''
  };

  constructor(
    private Servicio: UsuarioServicio,
    private route: ActivatedRoute,
    private router: Router,
    private ServicioRol: RolServicio,
    private ServicioEmpresa: EmpresaServicio
  ) {}

  ngOnInit(): void {
    this.CargarEmpresas();
    this.CargarRoles();
    this.ObtenerPorCodigo();
  }

  Roles: Rol[] = [];
  Empresas: Empresa[] = []; 

  ObtenerPorCodigo(): void {
    const Codigo = this.route.snapshot.paramMap.get('Codigo');
    if (Codigo) {
      this.Servicio.ObtenerPorCodigo(Codigo).subscribe({
        next: (DatosObtenidos) => this.Datos = DatosObtenidos,
        error: () => console.log("Error al obtener el registro")
      });
    }
  }

  CargarEmpresas(): void {
    this.ServicioEmpresa.Listado().subscribe({
      next: (data) => {
        this.Empresas = data;
      },
      error: (error) => {
        console.error("Error al cargar empresas", error);
      }
    });
  }

  CargarRoles(): void {
    this.ServicioRol.Listado().subscribe({
      next: (data) => {
        this.Roles = data;
      },
      error: (error) => {
        console.error("Error al cargar roles", error);
      }
    });
  }

  Editar(): void {
    this.Servicio.Editar(this.Datos).subscribe({
      next: () => {
        alert('Registro actualizado con éxito');
        this.router.navigate(['/usuario-listado']);
      },
      error: () => {
        console.log("Error al actualizar el registro");
      }
    });
  }

  NavegarListado(ruta: string) {
    this.router.navigate([ruta]);
  }
}
