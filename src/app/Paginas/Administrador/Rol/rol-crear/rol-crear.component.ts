import { Component } from '@angular/core';
import { RolServicio } from '../../../../Servicios/RolServicio';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../Menu/sidebar/sidebar.component';
import { NavbarComponent } from '../../Menu/navbar/navbar.component';
import { Rol } from '../../../../Modelos/Rol';

@Component({
  selector: 'app-rol-crear',
  imports: [FormsModule,CommonModule,SidebarComponent,NavbarComponent],
  templateUrl: './rol-crear.component.html',
  styleUrl: './rol-crear.component.css'
})
export class RolCrearComponent {
  Datos: Rol = {} as Rol; // Usamos el modelo sin definir campos manualmente

  constructor(private Servicio: RolServicio, private router: Router) {}

  Crear(): void {

    this.Servicio.Crear(this.Datos).subscribe({
      next: () => {
        alert('Registro creado con éxito');
        this.router.navigate(['/rol-listado']);
      },
      error: () => {
        console.log("Error al crear empresa");
      }
    });
  }


  NavegarListado(ruta: string) {
    this.router.navigate([ruta]);
  }
}
