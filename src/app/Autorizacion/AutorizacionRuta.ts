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
    console.log('AutorizacionRuta: canActivate llamado');
    console.log('Ruta solicitada (ActivatedRouteSnapshot):', next);
    console.log('Estado de la ruta (RouterStateSnapshot):', state);
    console.log('URL completa solicitada:', state.url);

    const tokenValido = this.LoginServicio.ValidarToken();
    console.log('Resultado de ValidarToken():', tokenValido);

    if (tokenValido) {
      console.log('Token válido, se permite el acceso a la ruta');
      return true;
    } else {
      console.log('Token inválido o inexistente, eliminando token...');
      this.LoginServicio.EliminarToken();
      console.log('Redirigiendo al login...');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
