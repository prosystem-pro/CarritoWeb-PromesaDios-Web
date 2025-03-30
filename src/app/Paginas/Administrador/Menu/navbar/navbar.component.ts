import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent {
  sidebarVisible = false; // Inicialmente el sidebar está oculto

    constructor( private router: Router) {}
  // Función para mostrar y ocultar el sidebar
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible; // Cambia el estado de la visibilidad
  }

  cerrarSesion(): void {
    // Lógica para cerrar sesión (puedes adaptarlo a tu sistema)
    window.location.href = '/login'; // Redirigir a la página de login
  }
  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }
}
