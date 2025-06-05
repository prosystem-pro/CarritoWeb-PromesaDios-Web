import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { LoginServicio } from '../Servicios/LoginServicio';

@Injectable({
  providedIn: 'root'
})
export class AutorizacionRuta implements CanActivate {

  constructor(private LoginServicio: LoginServicio, private router: Router) {}

 canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('--- AutorizacionRuta: canActivate ---');
    console.log('Ruta solicitada:', state.url);

    const tokenValido = this.LoginServicio.ValidarToken();
    console.log('Resultado de LoginServicio.ValidarToken():', tokenValido);

    if (tokenValido) {
      console.log('Token válido. Acceso permitido.');
      return true;
    } else {
      console.warn('Token inválido. Redirigiendo a /login...');
      this.LoginServicio.EliminarToken();
      console.log('Token eliminado. Redireccionando a login.');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
