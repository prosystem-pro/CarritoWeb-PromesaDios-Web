import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioCompartido } from '../../Servicios/ServicioCompartido';
import { EmpresaServicio } from '../../Servicios/EmpresaServicio';
import { ReporteProductoServicio } from '../../Servicios/ReporteProductoServicio';

interface ProductoConCantidad {
  CodigoProducto: number;
  NombreProducto: string;
  Precio: number;
  Moneda: string;
  UrlImagen: string;
  cantidad: number;
}

@Component({
  selector: 'app-carrito',
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit {
  @Output() cerrarCarrito = new EventEmitter<void>();
  datosEmpresa: any = null;

  productosCarrito: ProductoConCantidad[] = [];
  total: number = 0;
  colorNavbarEIcono: string = '';
  colorTextoNavbar: string = '';

  constructor(private carritoService: ServicioCompartido, private empresaServicio: EmpresaServicio,
    private ReporteProductoServicio: ReporteProductoServicio
  ) { }

  ngOnInit(): void {
    this.cargarProductosCarrito();
    this.calcularTotal();
    this.obtenerEstilosCarrito();
  }

  obtenerEstilosCarrito(): void {
    this.colorNavbarEIcono = localStorage.getItem('colorClasificacion') || '';
    this.colorTextoNavbar = localStorage.getItem('colorClasificacionTexto') || '';
  }

  cargarProductosCarrito(): void {
    const datosCarrito = localStorage.getItem('carrito');
    if (datosCarrito) {
      this.productosCarrito = JSON.parse(datosCarrito);
    }
  }

  calcularTotal(): void {
    this.total = this.productosCarrito.reduce((suma, producto) =>
      suma + (producto.Precio * producto.cantidad), 0);
  }

  aumentarCantidad(producto: ProductoConCantidad): void {
    producto.cantidad += 1;
    this.actualizarCarrito();
    this.carritoService.notificarCarritoVaciado();
  }

  disminuirCantidad(producto: ProductoConCantidad): void {
    if (producto.cantidad > 1) {
      producto.cantidad -= 1;
      this.actualizarCarrito();
    }
    this.carritoService.notificarCarritoVaciado();
  }

  eliminarProducto(indice: number): void {
    this.productosCarrito.splice(indice, 1);
    this.actualizarCarrito();
    this.carritoService.notificarCarritoVaciado();
  }

  vaciarCarrito(): void {
    this.productosCarrito = [];
    localStorage.removeItem('carrito');
    this.calcularTotal();
    this.carritoService.notificarCarritoVaciado();
    this.carritoService.actualizarContadorCarrito(0);
  }

  actualizarCarrito(): void {
    localStorage.setItem('carrito', JSON.stringify(this.productosCarrito));
    this.calcularTotal();
  }

  cerrar(): void {
    this.cerrarCarrito.emit();
  }
ReportarProductosVendidos(): void {
  const productosValidos = this.productosCarrito
    .filter(producto => producto.CodigoProducto && producto.cantidad)
    .map(producto => ({
      CodigoProducto: producto.CodigoProducto,
      CantidadVendida: producto.cantidad,
      Navegador: this.ObtenerNavegador()
    }));

  if (productosValidos.length === 0) {
    console.warn('No hay productos válidos para reportar.');
    return;
  }

  this.ReporteProductoServicio.Crear(productosValidos).subscribe({
    next: (respuesta) => console.log('Productos reportados correctamente', respuesta),
    error: (error) => console.error('Error al reportar productos', error)
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

  realizarPedido(): void {
    const nuevaVentana = window.open('', '_blank');

    if (!nuevaVentana) {
      console.error('El navegador bloqueó la ventana emergente.');
      return;
    }

    this.ReportarProductosVendidos();
    this.empresaServicio.Listado().subscribe({
      next: (data: any) => {
        this.datosEmpresa = data[0];

        const numTelefono = this.datosEmpresa?.Celular;
        if (!numTelefono) {
          console.error('El número de celular no está disponible.');
          nuevaVentana.close();
          return;
        }

        const mensaje = `Hola, me gustaría ordenar:\n${this.productosCarrito.map(producto =>
          `- ${producto.cantidad}x ${producto.NombreProducto} (${producto.Moneda} ${producto.Precio} c/u)`).join('\n')}\n\nTotal: ${this.productosCarrito[0].Moneda} ${this.total}`;

        const mensajeCodificado = encodeURIComponent(mensaje);
        const url = `https://wa.me/${numTelefono}?text=${mensajeCodificado}`;

        // 3. Redirigir la ventana abierta
        nuevaVentana.location.href = url;

        this.vaciarCarrito();
      },
      error: (error: any) => {
        console.error('Error al obtener los datos de la empresa:', error);
        nuevaVentana.close();
      }
    });
  }
}
