import { Component } from '@angular/core';
import { Empresa } from '../../../../Modelos/Empresa';
import { EmpresaServicio } from '../../../../Servicios/EmpresaServicio';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../Menu/sidebar/sidebar.component';
import { NavbarComponent } from '../../Menu/navbar/navbar.component';

@Component({
  selector: 'app-empresa-crear',
  imports: [FormsModule,CommonModule,SidebarComponent,NavbarComponent],
  templateUrl: './empresa-crear.component.html',
  styleUrl: './empresa-crear.component.css'
})
export class EmpresaCrearComponent {
  Datos: Empresa = {} as Empresa; // Usamos el modelo sin definir campos manualmente

  constructor(private Servicio: EmpresaServicio, private router: Router) {}

  Crear(): void {
    if (!this.ValidarFormulario()) return;

    this.Servicio.Crear(this.Datos).subscribe({
      next: () => {
        alert('Registro creado con éxito');
        this.router.navigate(['/empresa-listado']);
      },
      error: () => {
        console.log("Error al crear el registro");
      }
    });
  }

  ValidarFormulario(): boolean {
    if (!this.Datos.NombreEmpresa || !this.Datos.Direccion || !this.Datos.Celular) {
      alert("Todos los campos obligatorios deben estar llenos.");
      return false;
    }
    return true;
  }
  NavegarListado(ruta: string) {
    this.router.navigate([ruta]);
  }
}
