import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioCompartido } from '../../Servicios/ServicioCompartido';
import { EmpresaServicio } from '../../Servicios/EmpresaServicio';

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
  
  constructor(private carritoService: ServicioCompartido, private empresaServicio: EmpresaServicio) { }
  
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

  realizarPedido(): void {
    this.empresaServicio.Listado().subscribe({
      next: (data: any) => {
        this.datosEmpresa = data[0];
  
        const numTelefono = this.datosEmpresa?.Celular;
        if (!numTelefono) {
          console.error('El número de celular no está disponible.');
          return;
        }
  
        const mensaje = `Hola, me gustaría ordenar:\n${this.productosCarrito.map(producto =>
          `- ${producto.cantidad}x ${producto.NombreProducto} (${producto.Moneda} ${producto.Precio} c/u)`).join('\n')}\n\nTotal: ${this.productosCarrito[0].Moneda} ${this.total}`;
  
        const mensajeCodificado = encodeURIComponent(mensaje);
        window.open(`https://wa.me/${numTelefono}?text=${mensajeCodificado}`, '_blank');
      },
      error: (error: any) => {
        console.error('Error al obtener los datos de la empresa:', error);
      }
    });
  }
}
