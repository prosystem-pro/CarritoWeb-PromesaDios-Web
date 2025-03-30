import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisoRolRecursoListadoComponent } from './permiso-rol-recurso-listado.component';

describe('PermisoRolRecursoListadoComponent', () => {
  let component: PermisoRolRecursoListadoComponent;
  let fixture: ComponentFixture<PermisoRolRecursoListadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermisoRolRecursoListadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermisoRolRecursoListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
