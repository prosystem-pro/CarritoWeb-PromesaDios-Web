import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';

@Injectable({
  providedIn: 'root'
})
export class LoginServicio {
  private Url = Entorno.ApiUrl;

  constructor(private http: HttpClient) {}

 Login(NombreUsuario: string, Clave: string): Observable<any> {
    const Datos = { NombreUsuario, Clave };
    const url = `${this.Url}login`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    console.log('[LoginServicio] Enviando login a:', url);
    console.log('[LoginServicio] Datos:', Datos);

    return new Observable(observer => {
      this.http.post(url, Datos, { headers }).subscribe({
        next: (Respuesta: any) => {
          console.log('[LoginServicio] Respuesta recibida:', Respuesta);

          if (Respuesta && Respuesta.Token) {
            console.log('[LoginServicio] Token recibido:', Respuesta.Token);
            this.GuardarToken('authToken', Respuesta.Token);
          } else {
            console.warn('[LoginServicio] No se recibió token en la respuesta');
          }

          observer.next(Respuesta);
          observer.complete();
        },
        error: (Error) => {
          console.error('[LoginServicio] Error al hacer login:', Error);
          observer.error(Error);
        }
      });
    });
  }

  ObtenerToken(): string | null {
    const token = localStorage.getItem('authToken');
    console.log('[LoginServicio] ObtenerToken():', token);
    return token;
  }

  GuardarToken(variable: string, valor: string): void {
    console.log(`[LoginServicio] GuardarToken(): Guardando ${variable} = ${valor}`);
    localStorage.setItem(variable, valor);
  }

  EliminarToken(): void {
    console.log('[LoginServicio] EliminarToken(): Eliminando authToken del localStorage');
    localStorage.removeItem('authToken');
  }

  ValidarToken(): boolean {
    const token = this.ObtenerToken();
    console.log('[LoginServicio] ValidarToken(): Token obtenido:', token);

    if (!token) {
      console.warn('[LoginServicio] ValidarToken(): No hay token');
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiracion = payload.exp * 1000;
      const ahora = Date.now();

      console.log('[LoginServicio] ValidarToken(): Payload:', payload);
      console.log('[LoginServicio] ValidarToken(): Expira en (ms):', expiracion);
      console.log('[LoginServicio] ValidarToken(): Fecha actual (ms):', ahora);

      if (expiracion < ahora) {
        console.warn('[LoginServicio] ValidarToken(): Token expirado');
        this.EliminarToken();
        return false;
      }

      console.log('[LoginServicio] ValidarToken(): Token válido');
      return true;
    } catch (error) {
      console.error('[LoginServicio] ValidarToken(): Error al decodificar token:', error);
      this.EliminarToken();
      return false;
    }
  }
  
}
