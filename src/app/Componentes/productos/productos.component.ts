import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoServicio } from '../../Servicios/ProductoServicio';
import { Producto } from '../../Modelos/Producto';
import { HttpClient } from '@angular/common/http';
import { Entorno } from '../../Entornos/Entorno';
import { ServicioCompartido } from '../../Servicios/ServicioCompartido';
import { SvgDecoradorComponent } from '../svg-decorador/svg-decorador.component';
import { CarritoComponent } from '../carrito/carrito.component';
import { Subscription } from 'rxjs';

interface ProductoConCantidad extends Producto {
  cantidad?: number;
  imagenPreview?: string | null;
  imagenFile?: File | null;
}

interface PrecioTemp {
  moneda: string;
  valor: number;
}

@Component({
  selector: 'app-productos',
  imports: [CommonModule, FormsModule, SvgDecoradorComponent, CarritoComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit, OnDestroy {
  private Url = `${Entorno.ApiUrl}`;
  private NombreEmpresa = `${Entorno.NombreEmpresa}`;
  private subscription!: Subscription;

  // Variables originales
  productos: ProductoConCantidad[] = [];
  nombreClasificacion: string = '';
  codigoClasificacion: number = 0;
  cargando: boolean = true;
  error: string | null = null;
  totalItemsCarrito: number = 0;
  mostrarCarrito = false;

  ordenAscendente: boolean = true;
  colorFooter: string = '';
  colorClasificacion: string = '';
  colorTextoClasificacion: string = '';
  terminoBusqueda: string = '';
  mostrarResultados: boolean = false;
  resultadosBusqueda: Producto[] = [];
  productosOriginales: ProductoConCantidad[] = [];
  busquedaActiva: boolean = false;
  DatosHeader: any = null;

  // Variables para el modo edición
  modoEdicion: boolean = false;
  tituloOriginal: string = '';
  tituloTemporal: string = '';
  
  // Variables para editar nombres de productos
  editandoNombre: number | null = null;
  nombreOriginal: string = '';
  nombreTemporal: string = '';
  
  // Variables para editar precios de productos
  editandoPrecio: number | null = null;
  precioOriginal: string = '';
  precioTemporal: string = '';
  precioTemp: PrecioTemp = {
    moneda: '',
    valor: 0
  };
  
  // Variables para nuevo producto
  creandoNuevoProducto: boolean = false;
  nuevaImagenPreview: string | null = null;
  nuevaImagenFile: File | null = null;
  nuevoProducto: ProductoConCantidad = this.inicializarNuevoProducto();

  @ViewChild('nuevaImagenInput') nuevaImagenInput!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('titleContent') titleContent!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoServicio: ProductoServicio,
    private servicioCompartido: ServicioCompartido,
    private http: HttpClient
  ) {     this.actualizarTotalCarrito();
    // Escuchar cambios en localStorage para actualizar el contador del carrito
    window.addEventListener('storage', () => {
      this.actualizarTotalCarrito();
    });}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['codigo']) {
        this.codigoClasificacion = +params['codigo'];
        this.nombreClasificacion = params['nombre'] || 'Productos';
        this.tituloOriginal = this.nombreClasificacion;
        this.cargarProductos(this.codigoClasificacion);
      }
    });
    
    this.servicioCompartido.colorFooter$.subscribe(color => {
      this.colorFooter = color;
    });
    
    this.servicioCompartido.datosClasificacion$.subscribe(datos => {
      this.colorClasificacion = datos.colorClasificacionFondo || localStorage.getItem('colorClasificacion') || '';
      this.colorTextoClasificacion = datos.colorClasificacionTexto || localStorage.getItem('colorClasificacionTexto') || '';
    });

    this.servicioCompartido.datosHeader$.subscribe((datos) => {
      this.DatosHeader = datos;
    });

    this.subscription = this.servicioCompartido.carritoVaciado$.subscribe(() => {
      this.actualizarTotalCarrito();
    });
    
    // Recuperar el total de items en el carrito si existe en localStorage
    this.actualizarTotalCarrito();
  }

  ngOnDestroy(): void {
    // Importante: desuscribirse para evitar memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
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
        this.productosOriginales = [...this.productos]; // Guardar una copia original para restaurar
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.error = 'No se pudieron cargar los productos. Contacte al administrador.';
        this.cargando = false;
      }
    });
  }
  
  // Métodos originales
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
  
  ordenarProductos(): void {
    if (!this.productos) return;
  
    this.ordenAscendente = !this.ordenAscendente;
  
    this.productos.sort((a, b) => {
      const nombreA = a?.NombreProducto || '';
      const nombreB = b?.NombreProducto || '';
  
      return this.ordenAscendente
        ? nombreA.localeCompare(nombreB)
        : nombreB.localeCompare(nombreA);
    });
  }
  

  // ============= MÉTODOS PARA MODO EDICIÓN =============
  
  toggleModoEdicion(): void {
    this.modoEdicion = !this.modoEdicion;
    this.crearNuevoProducto();
    
    // Si salimos del modo edición, resetear todos los estados de edición
    if (!this.modoEdicion) {
      this.cancelarEdicionNombre(null);
      this.cancelarEdicionPrecio(null);
      this.cancelarNuevoProducto();
    }
  }
  
  // ---- Edición del título de la categoría ----
  
  iniciarEdicionTitulo(): void {
    this.tituloOriginal = this.nombreClasificacion;
    this.tituloTemporal = this.nombreClasificacion;
  }
  
  // ---- Edición del nombre de un producto ----
  
  iniciarEdicionNombre(producto: ProductoConCantidad | null): void {
    this.cancelarEdicionPrecio(null);
  
    if (!producto || !producto.CodigoProducto || !producto.NombreProducto) {
      console.warn('Producto inválido al intentar editar nombre:', producto);
      return;
    }
  
    this.editandoNombre = producto.CodigoProducto;
    this.nombreOriginal = producto.NombreProducto;
    this.nombreTemporal = producto.NombreProducto;
  }
  
  guardarNombre(producto: ProductoConCantidad): void {
    if (!this.nombreTemporal || this.nombreTemporal.trim() === '') {
      alert('El nombre del producto no puede estar vacío');
      return;
    }
    
    // Actualizar el nombre en el modelo
    producto.NombreProducto = this.nombreTemporal;
    
    // Llamar al servicio para actualizar en la base de datos
    this.productoServicio.Editar(producto).subscribe({
      next: (response) => {
        alert('Nombre del producto actualizado correctamente');
        this.editandoNombre = null;
      },
      error: (error) => {
        console.error('Error al actualizar nombre', error);
        alert('Error al actualizar el nombre del producto');
        // Restaurar el nombre original en caso de error
        producto.NombreProducto = this.nombreOriginal;
        this.editandoNombre = null;
      }
    });
  }
  
  cancelarEdicionNombre(producto: ProductoConCantidad | null): void {
    if (this.editandoNombre !== null) {
      // Buscar el producto que se estaba editando
      const productoEditado = this.productos.find(p => p.CodigoProducto === this.editandoNombre);
      
      if (productoEditado) {
        productoEditado.NombreProducto = this.nombreOriginal;
      }
      
      this.editandoNombre = null;
    }
  }
  
  // ---- Edición del precio de un producto ----
  
  iniciarEdicionPrecio(producto: ProductoConCantidad | null): void {
    this.cancelarEdicionNombre(null);
  
    if (!producto || !producto.CodigoProducto || !producto.Moneda || !producto.Precio) {
      console.warn('Producto inválido al intentar editar precio:', producto);
      return;
    }
  
    this.editandoPrecio = producto.CodigoProducto;
    this.precioTemp = {
      moneda: producto.Moneda,
      valor: producto.Precio
    };
  
    // Guardar el precio original para poder restaurarlo si se cancela
    this.precioOriginal = `${producto.Moneda} ${producto.Precio}`;
  }
  
  guardarPrecio(producto: ProductoConCantidad): void {
    if (!this.precioTemp.moneda || this.precioTemp.moneda.trim() === '') {
      alert('La moneda no puede estar vacía');
      return;
    }
    
    if (this.precioTemp.valor <= 0) {
      alert('El precio debe ser mayor que cero');
      return;
    }
    
    // Actualizar el producto
    producto.Moneda = this.precioTemp.moneda;
    producto.Precio = this.precioTemp.valor;
    
    // Llamar al servicio para actualizar en la base de datos
    this.productoServicio.Editar(producto).subscribe({
      next: (response) => {
        console.log('Precio actualizado correctamente', response);
        alert('Precio del producto actualizado correctamente');
        this.editandoPrecio = null;
      },
      error: (error) => {
        console.error('Error al actualizar precio', error);
        alert('Error al actualizar el precio del producto');
        
        // Restaurar valores originales
        const partes = this.precioOriginal.match(/([^\d]*)(\d+(?:\.\d+)?)/);
        if (partes) {
          producto.Moneda = partes[1].trim();
          producto.Precio = parseFloat(partes[2]);
        }
        
        this.editandoPrecio = null;
      }
    });
  }
  
  cancelarEdicionPrecio(producto: ProductoConCantidad | null): void {
    if (this.editandoPrecio !== null) {
      // Buscar el producto que se estaba editando
      const productoEditado = this.productos.find(p => p.CodigoProducto === this.editandoPrecio);
      
      if (productoEditado) {
        // Restaurar valores originales
        const partes = this.precioOriginal.match(/([^\d]*)(\d+(?:\.\d+)?)/);
        if (partes) {
          productoEditado.Moneda = partes[1].trim();
          productoEditado.Precio = parseFloat(partes[2]);
        }
      }
      
      this.editandoPrecio = null;
    }
  }
  
  // ---- Cambiar imagen de un producto ----
  
  cambiarImagenProducto(evento: any, producto: ProductoConCantidad): void {
    const file = evento.target.files[0];
    if (file) {
      this.subirImagenProducto(file, producto);
    }
  }
  
  subirImagenProducto(file: File, producto: ProductoConCantidad): void {
    const formData = new FormData();
    formData.append('Imagen', file);
    formData.append('CarpetaPrincipal', this.NombreEmpresa);
    formData.append('SubCarpeta', 'Producto');
    formData.append('CodigoVinculado', this.codigoClasificacion.toString());
    formData.append('CodigoPropio', (producto.CodigoProducto ?? '').toString());
    formData.append('CampoVinculado', 'CodigoClasificacionProducto');
    formData.append('CampoPropio', 'CodigoProducto');
    formData.append('NombreCampoImagen', 'UrlImagen');

    alert('Actualizando imagen...');

    this.http.post(`${this.Url}subir-imagen`, formData).subscribe({
      next: (response: any) => {
        console.log('Imagen subida correctamente', response);

        if (response && response.Entidad && response.Entidad.UrlImagen) {
          // Actualizar la URL de la imagen en el producto
          producto.UrlImagen = response.Entidad.UrlImagen;
          alert('Imagen actualizada correctamente');
        } else {
          alert('Error al procesar la respuesta del servidor');
          console.warn('No se pudo obtener la URL de la imagen', response);
          
          // Recargar productos para obtener la imagen actualizada
          this.cargarProductos(this.codigoClasificacion);
        }
      },
      error: (error) => {
        console.error('Error al subir la imagen', error);
        alert('Error al subir la imagen. Por favor, intente de nuevo.');
      }
    });
  }
  
  // ---- Nuevo producto simplificado ----
  
  inicializarNuevoProducto(): ProductoConCantidad {
    return {
      CodigoProducto: 0,
      CodigoClasificacionProducto: this.codigoClasificacion,
      NombreProducto: '',
      Moneda: 'Q',
      Precio: 0,
      UrlImagen: '',
      Estatus: 1,
      cantidad: 1
    };
  }
  
  crearNuevoProducto(): void {
    // Cerrar cualquier edición en curso
    this.cancelarEdicionNombre(null);
    this.cancelarEdicionPrecio(null);
    
    this.creandoNuevoProducto = true;
    this.nuevoProducto = this.inicializarNuevoProducto();
    this.nuevoProducto.CodigoClasificacionProducto = this.codigoClasificacion;
    this.nuevaImagenPreview = null;
    this.nuevaImagenFile = null;
  }
  
  cancelarNuevoProducto(): void {
    this.creandoNuevoProducto = false;
    this.nuevoProducto = this.inicializarNuevoProducto();
    this.nuevaImagenPreview = null;
    this.nuevaImagenFile = null;
  }
  
  seleccionarNuevaImagen(evento: any): void {
    const file = evento.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.nuevaImagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);
      
      this.nuevaImagenFile = file;
    }
  }
  
  esFormularioValido(): boolean {
    if (!this.nuevoProducto || !this.nuevoProducto.NombreProducto || !this.nuevoProducto.Precio) {
      return false;
    }
    
    return (
      this.nuevoProducto.NombreProducto.trim() !== '' &&
      this.nuevoProducto.Precio > 0 &&
      this.nuevaImagenFile !== null
    );
  }

  guardarNuevoProducto(): void {
    if (!this.esFormularioValido()) {
      alert('Por favor, complete todos los campos y seleccione una imagen');
      return;
    }

    // Verificar si ya existe un producto con el mismo nombre
  if (this.nuevoProducto.NombreProducto && this.existeProductoConMismoNombre(this.nuevoProducto.NombreProducto)) {
    alert('Ya existe un producto con el mismo nombre. Por favor, elija otro nombre.');
    return;
  }
    
    // 1. Primero subir la imagen (esto crea el registro del producto automáticamente)
    this.subirImagenNuevoProducto();
  }
  
  subirImagenNuevoProducto(): void {
    if (!this.nuevaImagenFile) return;
    
    const formData = new FormData();
    formData.append('Imagen', this.nuevaImagenFile);
    formData.append('CarpetaPrincipal', this.NombreEmpresa);
    formData.append('SubCarpeta', 'Producto');
    formData.append('CodigoVinculado', this.codigoClasificacion.toString());
    formData.append('CodigoPropio', ''); // Vacío para que el servidor cree uno nuevo
    formData.append('CampoVinculado', 'CodigoClasificacionProducto');
    formData.append('CampoPropio', 'CodigoProducto');
    formData.append('NombreCampoImagen', 'UrlImagen');

    alert('Creando producto...');

    this.http.post(`${this.Url}subir-imagen`, formData).subscribe({
      next: (response: any) => {
        console.log('Imagen subida y producto creado inicialmente', response);
        
        if (response && response.Entidad && response.Entidad.CodigoProducto) {
          // 2. Capturar el CodigoProducto generado
          const codigoProductoGenerado = response.Entidad.CodigoProducto;
          
          // 3. Actualizar el producto con el nombre, precio y moneda
          const productoActualizado: Producto = {
            CodigoProducto: codigoProductoGenerado,
            CodigoClasificacionProducto: this.codigoClasificacion,
            NombreProducto: this.nuevoProducto.NombreProducto,
            Moneda: this.nuevoProducto.Moneda || '',
            Precio: this.nuevoProducto.Precio || 0,
            UrlImagen: response.Entidad.UrlImagen || '',
            Estatus: 1
          };
          
          // 4. Llamar al servicio para actualizar los datos
          this.productoServicio.Editar(productoActualizado).subscribe({
            next: (editResponse) => {
              console.log('Producto completado correctamente', editResponse);
              alert('Producto creado exitosamente');
              
              // 5. Recargar productos y cerrar formulario
              this.cargarProductos(this.codigoClasificacion);
              this.cancelarNuevoProducto();
            },
            error: (editError) => {
              console.error('Error al completar datos del producto', editError);
              alert('El producto se creó pero hubo un error al actualizar sus datos. Por favor edítelo manualmente.');
              
              // Recargar de todas formas y cerrar formulario
              this.cargarProductos(this.codigoClasificacion);
              this.cancelarNuevoProducto();
            }
          });
        } else {
          alert('Error al procesar la respuesta del servidor');
          console.warn('No se pudo obtener el código del producto', response);
        }
      },
      error: (error) => {
        console.error('Error al subir la imagen y crear el producto', error);
        alert('Error al crear el producto. Por favor, intente de nuevo.');
      }
    });
  }

  existeProductoConMismoNombre(nombre: string | undefined): boolean {
    if (!nombre || nombre.trim() === '') return false;
    
    const nombreNormalizado = nombre.trim().toLowerCase();
    return this.productos.some(producto => 
      producto.NombreProducto && producto.NombreProducto.trim().toLowerCase() === nombreNormalizado
    );
  }
  
  // ---- Eliminar producto ----
  
  eliminarProducto(producto: ProductoConCantidad): void {
    if (!producto.CodigoProducto) {
      alert('El producto no tiene un código válido.');
      return;
    }
    
    if (confirm(`¿Está seguro que desea eliminar el producto "${producto.NombreProducto}"?`)) {
      this.productoServicio.Eliminar(producto.CodigoProducto).subscribe({
        next: (response) => {
          console.log('Producto eliminado correctamente', response);
          
          // Eliminar de la lista local
          this.productos = this.productos.filter(p => p.CodigoProducto !== producto.CodigoProducto);
          
          alert('Producto eliminado correctamente');
        },
        error: (error) => {
          console.error('Error al eliminar el producto', error);
          alert('Error al eliminar el producto. Por favor, intente de nuevo.');
        }
      });
    }
  }

  buscar(): void {
    this.buscarEnTiempoReal();
    console.log('Buscando:', this.terminoBusqueda);
    this.productos = this.resultadosBusqueda;
    this.busquedaActiva = true;
  }

  buscarEnTiempoReal(): void {
    if (this.terminoBusqueda.length === 0) {
      return;
    }
  
    const termino = this.terminoBusqueda.toLowerCase();
    this.resultadosBusqueda = this.productosOriginales.filter(producto => 
      producto.NombreProducto?.toLowerCase().includes(termino) ?? false
    );
  }

  seleccionarProducto(): void {
    this.productos = this.resultadosBusqueda;
    this.mostrarResultados = false;
    this.busquedaActiva = true;
  }

  cancelarBusqueda(): void {
    if (this.terminoBusqueda.trim()) {
      this.busquedaActiva = false;
      this.terminoBusqueda = "";
      this.productos = this.productosOriginales; // Restaurar la lista original
    }
  }

  ocultarResultados(): void {
    setTimeout(() => {
      this.mostrarResultados = false;
    }, 200);
  }

  //Método para ver el carrito
  alternarCarrito() {
    this.mostrarCarrito = !this.mostrarCarrito;
    // Si activamos el carrito, actualizamos el contador
    if (this.mostrarCarrito) {
      this.actualizarTotalCarrito();
    }
  }
}