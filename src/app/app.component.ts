import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './Componentes/header/header.component';
import { NgIf } from '@angular/common';
import { FooterComponent } from './Componentes/footer/footer.component';
import { ReporteVistaServicio } from './Servicios/ReporteVistaServicio';
import { ReporteTiempoPaginaServicio } from './Servicios/ReporteTiempoPaginaServicio';
import { Entorno } from './Entornos/Entorno';
import { SidebarRedSocialComponent } from './Componentes/sidebar-red-social/sidebar-red-social.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, NgIf, FooterComponent, SidebarRedSocialComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  title = 'CarritoWeb-Web';
  private horaEntrada: number = 0;
  private intervaloEnvio: any;
  private tiempoAcumuladoMs: number = 0;

  constructor(
    private router: Router,
    private ReporteVistaServicio: ReporteVistaServicio,
    private ReporteTiempoPaginaServicio: ReporteTiempoPaginaServicio
  ) { }

  ngOnInit(): void {
    this.horaEntrada = Date.now();

    const EntradasNavegacion = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];

    const EsRecarga = EntradasNavegacion.length > 0
      ? EntradasNavegacion[0].type === 'reload'
      : performance.navigation.type === 1;

    const EsAccesoDirecto = EntradasNavegacion.length > 0
      ? EntradasNavegacion[0].type === 'navigate'
      : performance.navigation.type === 0;

    if (EsRecarga || EsAccesoDirecto) {
      this.ReportarVista();
    }
  //     setTimeout(() => {
  //   this.probarEnvioBeacon();
  // }, 5000); // 5 segundos
  }

  @HostListener('window:beforeunload', ['$event'])
  // registrarSalida(event: Event): void {
  //   const horaSalida = Date.now();
  //   const tiempoMs = horaSalida - this.horaEntrada;
  //   const tiempoFormateado = this.formatearTiempo(tiempoMs);
  //   this.RegistrarTiempoPagina(tiempoFormateado);
  // }
//   probarEnvioBeacon(): void {
//   const horaSalida = Date.now();
//   const tiempoMs = horaSalida - this.horaEntrada;
//   const tiempoFormateado = this.formatearTiempo(tiempoMs);

//   const datos = {
//     TiempoPromedio: tiempoFormateado,
//     Navegador: this.ObtenerNavegador()
//   };

//   console.log('🧪 [TEST] Probando envío con sendBeacon');
//   console.log('Datos a enviar:', datos);

//   const blob = new Blob([JSON.stringify(datos)], { type: 'application/json' });

//   const exito = navigator.sendBeacon(
//     'https://carritoweb-promesadios-api.onrender.com/api/reportetiempopagina/crear',
//         // 'http://localhost:1433/api/reportetiempopagina/crear',
//     blob
//   );

//   if (exito) {
//     console.log('✅ [TEST] Beacon enviado correctamente.');
//   } else {
//     console.warn('⚠️ [TEST] Beacon NO se pudo enviar.');
//   }
// }

registrarSalida(event: Event): void {
  const horaSalida = Date.now();
  const tiempoMs = horaSalida - this.horaEntrada;
  const tiempoFormateado = this.formatearTiempo(tiempoMs);

  const datos = {
    TiempoPromedio: tiempoFormateado,
    Navegador: this.ObtenerNavegador()
  };

  console.log('⏳ Registrando salida...');
  console.log('Datos a enviar:', datos);

  const blob = new Blob([JSON.stringify(datos)], { type: 'application/json' });

  const exito = navigator.sendBeacon(
    'https://carritoweb-promesadios-api.onrender.com/api/reportetiempopagina/crear',
    blob
  );

  if (exito) {
    console.log('✅ Beacon enviado correctamente.');
  } else {
    console.warn('⚠️ Beacon NO se pudo enviar.');
  }
}


  RegistrarTiempoPagina(tiempoFormateado: string): void {
    const Datos = {
      TiempoPromedio: tiempoFormateado,
      Navegador: this.ObtenerNavegador()
    };

    this.ReporteTiempoPaginaServicio.Crear(Datos).subscribe({
      next: (Respuesta) => console.log('Tiempo registrado con éxito:', Respuesta),
      error: (Error) => console.error('Error al registrar tiempo en página:', Error)
    });
  }

  formatearTiempo(ms: number): string {
    const totalSegundos = Math.floor(ms / 1000);
    const horas = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
    const minutos = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
    const segundos = (totalSegundos % 60).toString().padStart(2, '0');
    return `${horas}:${minutos}:${segundos}`;
  }








  ReportarVista(): void {
    const Datos = {
      Navegador: this.ObtenerNavegador()
    };

    this.ReporteVistaServicio.Crear(Datos).subscribe({
      next: (Respuesta) => console.log('Vista reportada con éxito:', Respuesta),
      error: (Error) => console.error('Error al reportar vista:', Error)
    });
  }

  ObtenerNavegador(): string {
    const AgenteUsuario = navigator.userAgent;

    if (AgenteUsuario.includes('Chrome') && !AgenteUsuario.includes('Edg')) {
      return 'Chrome';
    } else if (AgenteUsuario.includes('Firefox')) {
      return 'Firefox';
    } else if (AgenteUsuario.includes('Safari') && !AgenteUsuario.includes('Chrome')) {
      return 'Safari';
    } else if (AgenteUsuario.includes('Edg')) {
      return 'Edge';
    } else {
      return 'Desconocido';
    }
  }

  // Rutas auxiliares
  esLogin(): boolean {
    return this.router.url === '/login';
  }

  esProductos(): boolean {
    return this.router.url.startsWith('/productos');
  }

  esContacto(): boolean {
    return this.router.url === '/contacto';
  }

  esOtro(): boolean {
    return this.router.url === '/otro';
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
