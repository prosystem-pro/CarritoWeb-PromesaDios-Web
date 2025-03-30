import { Component } from '@angular/core';
import { Permiso } from '../../../../Modelos/Permiso';
import { PermisoServicio } from '../../../../Servicios/PermisoServicio';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../Menu/sidebar/sidebar.component';
import { NavbarComponent } from '../../Menu/navbar/navbar.component';


@Component({
  selector: 'app-permiso-crear',
  imports: [FormsModule,CommonModule,SidebarComponent,NavbarComponent],
  templateUrl: './permiso-crear.component.html',
  styleUrl: './permiso-crear.component.css'
})
export class PermisoCrearComponent {
  Datos: Permiso = {} as Permiso; // Usamos el modelo sin definir campos manualmente

  constructor(private Servicio: PermisoServicio, private router: Router) {}

  Crear(): void {
    this.Servicio.Crear(this.Datos).subscribe({
      next: () => {
        alert('Registro creado con éxito');
        this.router.navigate(['/permiso-listado']);
      },
      error: () => {
        console.log("Error al crear el registro");
      }
    });
  }

  NavegarListado(ruta: string) {
    this.router.navigate([ruta]);
  }
}
