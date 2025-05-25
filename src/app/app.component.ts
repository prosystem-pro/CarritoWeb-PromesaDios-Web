import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './Componentes/header/header.component';
import { NgIf } from '@angular/common';
import { FooterComponent } from './Componentes/footer/footer.component';
import { filter } from 'rxjs/operators';
import { ReporteVistaServicio } from './Servicios/ReporteVistaServicio';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NgIf, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  
  title = 'CarritoWeb-Web';
  constructor(private router: Router, private ReporteVistaServicio: ReporteVistaServicio) { }

// ngOnInit(): void {
//   this.router.events
//     .pipe(filter(event => event instanceof NavigationEnd))
//     .subscribe(event => {
//       this.reportarVista();
//     });
// }

// reportarVista() {
//   const datos = {
//     NombreDiagrama: 'Aristoteles',
//     Navegador: this.ObtenerNavegador()
//   };

//   this.ReporteVistaServicio.Crear(datos).subscribe({
//     next: (res) => console.log('Vista reportada con éxito:', res),
//     error: (err) => console.error(' Error al reportar vista:', err)
//   });
// }
// ObtenerNavegador(): string {
//   const userAgent = navigator.userAgent;

//   if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
//     return 'Chrome';
//   } else if (userAgent.includes('Firefox')) {
//     return 'Firefox';
//   } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
//     return 'Safari';
//   } else if (userAgent.includes('Edg')) {
//     return 'Edge';
//   } else {
//     return 'Desconocido';
//   }
// }

//   obtenerIPLocal(): string {
//     return '0.0.0.0'; 
//   }
  esLogin(): boolean {
    return this.router.url === '/login'; // Retorna `true` si está en la ruta de login
  }

  esProductos(): boolean {
    return this.router.url.startsWith('/productos');
  }

  esReporteProducto(): boolean {
    return this.router.url === '/reporte-producto';
  }
  esReporteVista(): boolean {
    return this.router.url === '/reporte-vista';
  }
  esReporteRedSocial(): boolean {
    return this.router.url === '/reporte-red-social';
  }

  esReporteTiempoPagina(): boolean {
    return this.router.url === '/reporte-tiempo-pagina';
  }
}
