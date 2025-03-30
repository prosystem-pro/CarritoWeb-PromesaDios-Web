import { Component } from '@angular/core';
import { LoginServicio } from '../../../../Servicios/LoginServicio';
import { Router } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
  imports: [NavbarComponent, SidebarComponent],

})
export class MenuComponent {
  sidebarVisible = false;

  constructor(private loginServicio: LoginServicio,private router: Router) { }
  
  cerrarSesion(): void {
    // Llamamos al servicio para eliminar el token
    this.loginServicio.EliminarToken();
    
    // Realizamos redirección, por ejemplo, a la página de login
    window.location.href = '/login';  // O usa el router para redirigir a la página de login si es necesario
  }
  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }
  toggleSidebadr() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  sidebarVidsible = false;

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
}
