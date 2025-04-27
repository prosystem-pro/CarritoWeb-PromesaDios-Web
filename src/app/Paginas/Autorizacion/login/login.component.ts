import { Component } from '@angular/core';
import { LoginServicio } from '../../../Servicios/LoginServicio';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  NombreUsuario: string = '';
  Clave: string = '';
  errorMessage: string = '';

  constructor(private LoginServicio: LoginServicio, private router: Router) { }

  login(): void {
    this.LoginServicio.Login(this.NombreUsuario, this.Clave).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        this.router.navigate(['/nosotros']);
      },
      error: (error) => {
        console.error('Error en el login', error);
        this.errorMessage = 'Usuario o contraseña incorrectos';
      }
    });
  }
}
