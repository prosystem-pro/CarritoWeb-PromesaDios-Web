import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginServicio } from '../../../../Servicios/LoginServicio';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  sidebarVisible = false; // Controla la visibilidad del sidebar

  constructor(private loginServicio: LoginServicio, private router: Router) {}

  // Función para alternar la visibilidad del sidebar en pantallas pequeñas
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  // Función para navegar a una ruta
  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  // Función para cerrar sesión
  cerrarSesion(): void {
    this.loginServicio.EliminarToken();
    window.location.href = '/login';
  }
}
