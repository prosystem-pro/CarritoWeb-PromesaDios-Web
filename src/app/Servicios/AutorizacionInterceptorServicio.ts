import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginServicio } from './LoginServicio'; 
import { catchError } from 'rxjs';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

export const AutorizacionInterceptor: HttpInterceptorFn = (Solicitud, Siguiente) => {
  const Servicio = inject(LoginServicio);
  const router = inject(Router);

  const Token = Servicio.ObtenerToken();
  console.log('[Interceptor] Token actual:', Token);

  if (Token) {
    Solicitud = Solicitud.clone({
      setHeaders: {
        Authorization: `Bearer ${Token}`
      }
    });
    console.log('[Interceptor] Token añadido a headers');
  } else {
    console.warn('[Interceptor] No se encontró token para añadir');
  }

  return Siguiente(Solicitud).pipe(
    catchError(Error => {
      console.error('[Interceptor] Error HTTP:', Error);
      if (Error.status === 401) {
        console.warn('[Interceptor] Token expirado/401 recibido. Eliminando token y redirigiendo');
        Servicio.EliminarToken();
        router.navigate(['/login']);
      }
      return throwError(() => Error);
    })
  );
};
