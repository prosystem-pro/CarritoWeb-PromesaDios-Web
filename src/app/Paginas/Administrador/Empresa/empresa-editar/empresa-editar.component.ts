import { Component, OnInit } from '@angular/core';
import { Empresa } from '../../../../Modelos/Empresa';
import { EmpresaServicio } from '../../../../Servicios/EmpresaServicio';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../Menu/sidebar/sidebar.component';
import { NavbarComponent } from '../../Menu/navbar/navbar.component';

@Component({
  selector: 'app-empresa-editar',
  imports: [FormsModule, CommonModule, SidebarComponent, NavbarComponent],
  templateUrl: './empresa-editar.component.html',
  styleUrl: './empresa-editar.component.css'
})
export class EmpresaEditarComponent {
  Datos: Empresa = {} as Empresa;

  constructor(
    private Servicio: EmpresaServicio,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.ObtenerPorCodigo();
  }

  ObtenerPorCodigo(): void {
    const Codigo = this.route.snapshot.paramMap.get('Codigo');
    if (Codigo) {
      this.Servicio.ObtenerPorCodigo(Codigo).subscribe({
        next: (DatosObtenidos) => this.Datos = DatosObtenidos,
        error: () => console.log("Error al obtener el registro")
      });
    }
  }

  Editar(): void {
    if (!this.ValidarFormulario()) return;

    this.Servicio.Editar(this.Datos).subscribe({
      next: () => {
        alert('Registro actualizado con éxito');
        this.router.navigate(['/empresa-listado']);
      },
      error: () => {
        console.log("Error al actualizar el registro");
      }
    });
  }

  ValidarFormulario(): boolean {
    if (!this.Datos.NombreEmpresa || !this.Datos.Direccion || !this.Datos.Celular) {
      alert("Todos los campos obligatorios deben estar llenos.");
      return false;
    }
    return true;
  }

  NavegarListado(ruta: string) {
    this.router.navigate([ruta]);
  }
}
