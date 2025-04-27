import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductoServicio } from '../../Servicios/ProductoServicio';
import { Producto } from '../../Modelos/Producto';

interface ProductoConCantidad extends Producto {
  cantidad?: number;
}

@Component({
  selector: 'app-productos',
  imports: [CommonModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  productos: ProductoConCantidad[] = [];
  nombreClasificacion: string = '';
  codigoClasificacion: number = 0;
  cargando: boolean = true;
  error: string | null = null;
  totalItemsCarrito: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoServicio: ProductoServicio
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['codigo']) {
        this.codigoClasificacion = +params['codigo'];
        this.nombreClasificacion = params['nombre'] || 'Productos';
        this.cargarProductos(this.codigoClasificacion);
      }
    });
    
    // Recuperar el total de items en el carrito si existe en localStorage
    this.actualizarTotalCarrito();
  }

  cargarProductos(codigo: number): void {
    this.cargando = true;
    this.error = null;

    this.productoServicio.ListadoProductos(codigo).subscribe({
      next: (data) => {
        // Agregar la propiedad cantidad a cada producto
        this.productos = data.map((producto: Producto) => ({
          ...producto,
          cantidad: 1
        }));
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error = 'No se pudieron cargar los productos. Mostrando datos de ejemplo.';
        // Ya tenemos los productos demo con cantidad inicializada
        this.cargando = false;
      }
    });
  }
  
  incrementarCantidad(producto: ProductoConCantidad): void {
    if (!producto.cantidad) {
      producto.cantidad = 1;
    }
    producto.cantidad++;
  }

  decrementarCantidad(producto: ProductoConCantidad): void {
    if (!producto.cantidad) {
      producto.cantidad = 1;
    }
    if (producto.cantidad > 1) {
      producto.cantidad--;
    }
  }
  
  agregarAlCarrito(producto: ProductoConCantidad): void {
    // Obtener el carrito actual del localStorage
    let carrito: ProductoConCantidad[] = [];
    const carritoGuardado = localStorage.getItem('carrito');
    
    if (carritoGuardado) {
      carrito = JSON.parse(carritoGuardado);
    }
    
    // Verificar si el producto ya está en el carrito
    const index = carrito.findIndex(item => item.CodigoProducto === producto.CodigoProducto);
    
    if (index !== -1) {
      // Si ya existe, actualizar la cantidad
      carrito[index].cantidad = (carrito[index].cantidad || 0) + (producto.cantidad || 1);
    } else {
      // Si no existe, agregar al carrito
      carrito.push({
        ...producto,
        cantidad: producto.cantidad || 1
      });
    }
    
    // Guardar el carrito actualizado
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Actualizar el contador del carrito
    this.actualizarTotalCarrito();
    
    console.log('Producto agregado al carrito:', producto);
  }

  actualizarTotalCarrito(): void {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      const carrito: ProductoConCantidad[] = JSON.parse(carritoGuardado);
      this.totalItemsCarrito = carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
    } else {
      this.totalItemsCarrito = 0;
    }
  }

  volver(): void {
    this.router.navigate(['/clasificacion']); // Ajusta esta ruta según tu estructura
  }
}