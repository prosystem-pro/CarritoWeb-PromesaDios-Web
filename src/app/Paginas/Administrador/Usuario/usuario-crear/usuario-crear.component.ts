import { Component } from '@angular/core';
import { UsuarioServicio } from '../../../../Servicios/UsuarioServicio';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../Menu/sidebar/sidebar.component';
import { NavbarComponent } from '../../Menu/navbar/navbar.component';

import { Rol } from '../../../../Modelos/Rol';
import { Empresa } from '../../../../Modelos/Empresa';
import { RolServicio } from '../../../../Servicios/RolServicio';
import { EmpresaServicio } from '../../../../Servicios/EmpresaServicio';

@Component({
  selector: 'app-usuario-crear',
  imports: [FormsModule, CommonModule, SidebarComponent, NavbarComponent],
  templateUrl: './usuario-crear.component.html',
  styleUrl: './usuario-crear.component.css'
})
export class UsuarioCrearComponent {
  Datos: any = { 
    NombreUsuario: '', 
    Clave: '', 
    Estatus: '',
    CodigoEmpresa: '',
    CodigoRol: ''
  };

  ngOnInit(): void {
    this.CargarEmpresas();
    this.CargarRoles();
  }

  Roles: Rol[] = [];
  Empresas: Empresa[] = []; 

  constructor(private Servicio: UsuarioServicio,
    private ServicioRol: RolServicio,
    private ServicioEmpresa: EmpresaServicio, 
    private router: Router) {}

  Crear(): void {
    this.Servicio.Crear(this.Datos).subscribe({
      next: () => {
        alert('Registro creado con éxito');
        this.router.navigate(['/usuario-listado']);
      },
      error: () => {}
    });
  }

  CargarEmpresas(): void {
    this.ServicioEmpresa.Listado().subscribe({
      next: (data) => {
        this.Empresas = data;
      },
      error: (error) => {}
    });
  }

  CargarRoles(): void {
    this.ServicioRol.Listado().subscribe({
      next: (data) => {
        this.Roles = data;
      },
      error: (error) => {}
    });
  }

  NavegarListado(ruta: string) {
    this.router.navigate([ruta]);
  }
}
