import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './Componentes/header/header.component';
import { NgIf } from '@angular/common';
import { FooterComponent } from './Componentes/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NgIf, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CarritoWeb-Web';
  constructor(private router: Router) {}

  esLogin(): boolean {
    return this.router.url === '/login'; // Retorna `true` si está en la ruta de login
  }
}
