import { Component } from '@angular/core';
import { RecursoServicio } from '../../../../Servicios/RecursoServicio';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../Menu/sidebar/sidebar.component';
import { NavbarComponent } from '../../Menu/navbar/navbar.component';
import { Recurso } from '../../../../Modelos/Recurso';
@Component({
  selector: 'app-recurso-crear',
  imports: [FormsModule,CommonModule,SidebarComponent,NavbarComponent],
  templateUrl: './recurso-crear.component.html',
  styleUrl: './recurso-crear.component.css'
})
export class RecursoCrearComponent {
  Datos: Recurso = {} as Recurso; // Usamos el modelo sin definir campos manualmente

  constructor(private Servicio: RecursoServicio, private router: Router) {}

  Crear(): void {

    this.Servicio.Crear(this.Datos).subscribe({
      next: () => {
        alert('Registro creado con éxito');
        this.router.navigate(['/recurso-listado']);
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
