import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entorno } from '../Entornos/Entorno';

@Injectable({
  providedIn: 'root'
})
export class PermisoRolRecursoServicio {
  private Url = `${Entorno.ApiUrl}permisorolrecurso`; 

  constructor(private http: HttpClient) {}

  Listado(): Observable<any> {
    return this.http.get(`${this.Url}/listado`);
  }
  
  Crear(Datos: any): Observable<any> {
    return this.http.post(`${this.Url}/crear`, Datos);
  }

  ObtenerPorCodigo(CodigoRol: number, CodigoPermiso: number, CodigoRecurso: number): Observable<any> {
    return this.http.get(`${this.Url}/${CodigoRol}/${CodigoPermiso}/${CodigoRecurso}`);
  }
  Editar(CodigoRol: number, CodigoPermiso: number,CodigoRecurso: number, Datos: any): Observable<any> {
    return this.http.put(`${this.Url}/editar/${CodigoRol}/${CodigoPermiso}/${CodigoRecurso}`, Datos);
  }

  Eliminar(CodigoRol: number, CodigoPermiso: number,CodigoRecurso: number): Observable<any> {
    return this.http.delete(`${this.Url}/eliminar/${CodigoRol}/${CodigoPermiso}/${CodigoRecurso}`);
  }
  ObtenerPermisos(CodigoRol: number): Observable<any> {
    return this.http.get(`${this.Url}/obtener-permisos/${CodigoRol}`);
  }
  
  ObtenerRecursos(CodigoRol: number, CodigoPermiso: number): Observable<any> {
    return this.http.get(`${this.Url}-obtener-recursos/${CodigoRol}/${CodigoPermiso}`);
  }

}
