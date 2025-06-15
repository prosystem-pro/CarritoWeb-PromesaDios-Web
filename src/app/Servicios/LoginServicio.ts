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

    return new Observable(observer => {
      this.http.post(url, Datos, { headers }).subscribe({
        next: (Respuesta: any) => {
          if (Respuesta) {
            this.GuardarToken('authToken', Respuesta.Token);
          }
          observer.next(Respuesta);
          observer.complete();
        },
        error: (Error) => observer.error(Error)
      });
    });
  }

  ObtenerToken(): string | null {
    return localStorage.getItem('authToken');
  }

  GuardarToken(variable: string, valor: string): void {
    localStorage.setItem(variable, valor);
  }

  EliminarToken(): void {
    localStorage.removeItem('authToken');
  }
  
ValidarToken(): boolean {
  const token = this.ObtenerToken();
  console.log('[LoginServicio] ValidarToken(): Token obtenido:', token);

  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiracion = payload.exp * 1000;
    const emitidoEn = payload.iat * 1000;
    const ahora = Date.now();

    console.log('[LoginServicio] ValidarToken(): Payload:', payload);
    console.log(`[LoginServicio] iat (fecha emisión): ${new Date(emitidoEn).toUTCString()} | Local: ${new Date(emitidoEn).toString()}`);
    console.log(`[LoginServicio] exp (fecha expiración): ${new Date(expiracion).toUTCString()} | Local: ${new Date(expiracion).toString()}`);
    console.log(`[LoginServicio] Fecha actual (sistema): ${new Date(ahora).toUTCString()} | Local: ${new Date(ahora).toString()}`);

    if (expiracion < ahora) {
      console.warn('[LoginServicio] ValidarToken(): ❌ Token expirado');
      this.EliminarToken();
      return false;
    }

    console.log('[LoginServicio] ValidarToken(): ✅ Token válido');
    return true;
  } catch (error) {
    console.error('[LoginServicio] ValidarToken(): ⚠️ Error decodificando token', error);
    this.EliminarToken();
    return false;
  }
}

}
