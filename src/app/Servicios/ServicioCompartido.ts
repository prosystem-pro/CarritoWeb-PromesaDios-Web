import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicioCompartido {
  private colorFooterSubject = new BehaviorSubject<string>('#ffffff'); // Valor por defecto
  colorFooter$ = this.colorFooterSubject.asObservable();

  setColorFooter(color: string) {
    this.colorFooterSubject.next(color);
  }
}
