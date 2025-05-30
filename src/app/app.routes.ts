import { Routes } from '@angular/router';
import { AutorizacionRuta } from './Autorizacion/AutorizacionRuta';
import { LoginComponent } from '../app/Paginas/Autorizacion/login/login.component';
import { MenuComponent } from '../app/Paginas/Administrador/Menu/menu/menu.component';
import { NavbarComponent } from '../app/Paginas/Administrador/Menu/navbar/navbar.component';
import { SidebarComponent } from '../app/Paginas/Administrador/Menu/sidebar/sidebar.component';
import { EmpresaListadoComponent } from '../app/Paginas/Administrador/Empresa/empresa-listado/empresa-listado.component';
import { EmpresaCrearComponent } from '../app/Paginas/Administrador/Empresa/empresa-crear/empresa-crear.component';
import { EmpresaEditarComponent } from '../app/Paginas/Administrador/Empresa/empresa-editar/empresa-editar.component';
import { UsuarioListadoComponent } from '../app/Paginas/Administrador/Usuario/usuario-listado/usuario-listado.component'
import { UsuarioCrearComponent } from '../app/Paginas/Administrador/Usuario/usuario-crear/usuario-crear.component'
import { UsuarioEditarComponent } from '../app/Paginas/Administrador/Usuario/usuario-editar/usuario-editar.component';
import { RolListadoComponent } from '../app/Paginas/Administrador/Rol/rol-listado/rol-listado.component';
import { RolCrearComponent } from '../app/Paginas/Administrador/Rol/rol-crear/rol-crear.component';
import { RolEditarComponent } from '../app/Paginas/Administrador/Rol/rol-editar/rol-editar.component';
import { PermisoListadoComponent } from '../app/Paginas/Administrador/Permiso/permiso-listado/permiso-listado.component';
import { PermisoCrearComponent } from '../app/Paginas/Administrador/Permiso/permiso-crear/permiso-crear.component';
import { PermisoEditarComponent } from '../app/Paginas/Administrador/Permiso/permiso-editar/permiso-editar.component';
import { RecursoListadoComponent } from '../app/Paginas/Administrador/Recurso/recurso-listado/recurso-listado.component';
import { RecursoCrearComponent } from '../app/Paginas/Administrador/Recurso/recurso-crear/recurso-crear.component';
import { RecursoEditarComponent } from '../app/Paginas/Administrador/Recurso/recurso-editar/recurso-editar.component';
import { PermisoRolRecursoListadoComponent } from '../app/Paginas/Administrador/PermisoRolRecurso/permiso-rol-recurso-listado/permiso-rol-recurso-listado.component';
import { PermisoRolRecursoCrearComponent } from '../app/Paginas/Administrador/PermisoRolRecurso/permiso-rol-recurso-crear/permiso-rol-recurso-crear.component';
import { NosotrosComponent } from './Paginas/Inicio/nosotros/nosotros.component';
import { MenuCategoriaComponent } from './Paginas/Inicio/menu/menuCategoria.component';
import { ProductosComponent } from './Componentes/productos/productos.component';
import { ContactoComponent } from './Paginas/Inicio/contacto/contacto.component';
import { OtroComponent } from './Paginas/Inicio/otro/otro.component';
import { ReporteProductoComponent } from './Paginas/Inicio/reporte-producto/reporte-producto.component';
import { HeaderReporteComponent } from './Componentes/header-reporte/header-reporte.component';
import { ReporteVistaComponent } from './Paginas/Inicio/reporte-vista/reporte-vista.component';
import { ReporteRedSocialComponent } from './Paginas/Inicio/reporte-red-social/reporte-red-social.component';
import { ReporteTiempoPaginaComponent } from './Paginas/Inicio/reporte-tiempo-pagina/reporte-tiempo-pagina.component';
import { LoginGuard } from './Servicios/loginGuard';

export const routes: Routes = [
  { path: '', redirectTo: '/nosotros', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },

  //Rutas publicas
  { path: 'nosotros', component: NosotrosComponent},
  { path: 'clasificacion', component: MenuCategoriaComponent},
  { path: 'productos/:codigo/:nombre', component: ProductosComponent },
  { path: 'productos/buscar', component: ProductosComponent },
  { path: 'contacto', component: ContactoComponent},
  { path: 'otro', component: OtroComponent},

  //Rutas protegidas
  { path: 'reporte-producto', component: ReporteProductoComponent,canActivate: [AutorizacionRuta] },
  { path: 'header-reporte', component: HeaderReporteComponent,canActivate: [AutorizacionRuta] },
  { path: 'reporte-vista', component: ReporteVistaComponent,canActivate: [AutorizacionRuta] },
  { path: 'reporte-red-social', component: ReporteRedSocialComponent,canActivate: [AutorizacionRuta] },
  { path: 'reporte-tiempo-pagina', component: ReporteTiempoPaginaComponent,canActivate: [AutorizacionRuta] },

  { path: 'menu', component: MenuComponent,canActivate: [AutorizacionRuta] },
  { path: 'navbar', component: NavbarComponent,canActivate: [AutorizacionRuta] },
  { path: 'sidebar', component: SidebarComponent,canActivate: [AutorizacionRuta] },
  { path: 'empresa-listado', component: EmpresaListadoComponent,canActivate: [AutorizacionRuta] },
  { path: 'empresa-crear', component: EmpresaCrearComponent,canActivate: [AutorizacionRuta] },
  { path: 'empresa-editar/:Codigo', component: EmpresaEditarComponent,canActivate: [AutorizacionRuta] },
  { path: 'usuario-listado', component: UsuarioListadoComponent,canActivate: [AutorizacionRuta] },
  { path: 'usuario-crear', component: UsuarioCrearComponent,canActivate: [AutorizacionRuta] },
  { path: 'usuario-editar/:Codigo', component: UsuarioEditarComponent,canActivate: [AutorizacionRuta] },
  { path: 'rol-listado', component: RolListadoComponent,canActivate: [AutorizacionRuta] },
  { path: 'rol-crear', component: RolCrearComponent,canActivate: [AutorizacionRuta] },
  { path: 'rol-editar/:Codigo', component: RolEditarComponent,canActivate: [AutorizacionRuta] },
  { path: 'permiso-listado', component: PermisoListadoComponent,canActivate: [AutorizacionRuta] },
  { path: 'permiso-crear', component: PermisoCrearComponent,canActivate: [AutorizacionRuta] },
  { path: 'permiso-editar/:Codigo', component: PermisoEditarComponent,canActivate: [AutorizacionRuta] },
  { path: 'recurso-listado', component: RecursoListadoComponent,canActivate: [AutorizacionRuta] },
  { path: 'recurso-crear', component: RecursoCrearComponent,canActivate: [AutorizacionRuta] },
  { path: 'recurso-editar/:Codigo', component: RecursoEditarComponent,canActivate: [AutorizacionRuta] },
  { path: 'permiso-rol-recurso-listado', component: PermisoRolRecursoListadoComponent,canActivate: [AutorizacionRuta] },
  { path: 'permiso-rol-recurso-crear', component: PermisoRolRecursoCrearComponent,canActivate: [AutorizacionRuta] },
  { path: '**', redirectTo: 'nosotros' },
];
