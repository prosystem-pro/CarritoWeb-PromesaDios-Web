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
  const tokenValido = this.LoginServicio.ValidarToken();

  if (tokenValido) {
    return true;
  } else {
    this.LoginServicio.EliminarToken();
    this.router.navigate(['/login']);
    return false;
  }
}
}
