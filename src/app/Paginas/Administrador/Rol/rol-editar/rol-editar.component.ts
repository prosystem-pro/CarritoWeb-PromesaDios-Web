import { Component, OnInit } from '@angular/core';
import { Rol } from '../../../../Modelos/Rol';
import { RolServicio } from '../../../../Servicios/RolServicio';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../Menu/sidebar/sidebar.component';
import { NavbarComponent } from '../../Menu/navbar/navbar.component';
@Component({
  selector: 'app-rol-editar',
  imports: [FormsModule, CommonModule, SidebarComponent, NavbarComponent],
  templateUrl: './rol-editar.component.html',
  styleUrl: './rol-editar.component.css'
})
export class RolEditarComponent {
  Datos: Rol = {} as Rol;

  constructor(
    private Servicio: RolServicio,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.ObtenerPorCodigo();
  }

  ObtenerPorCodigo(): void {
    const Codigo = this.route.snapshot.paramMap.get('Codigo');
    if (Codigo) {
      this.Servicio.ObtenerPorCodigo(Codigo).subscribe({
        next: (DatosObtenidos) => this.Datos = DatosObtenidos,
        error: () => console.log("Error al obtener el registro")
      });
    }
  }

  Editar(): void {

    this.Servicio.Editar(this.Datos).subscribe({
      next: () => {
        alert('Registro actualizado con éxito');
        this.router.navigate(['/rol-listado']);
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
