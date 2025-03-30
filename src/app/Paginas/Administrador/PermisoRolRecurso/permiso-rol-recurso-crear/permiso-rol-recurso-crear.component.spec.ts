import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisoRolRecursoCrearComponent } from './permiso-rol-recurso-crear.component';

describe('PermisoRolRecursoCrearComponent', () => {
  let component: PermisoRolRecursoCrearComponent;
  let fixture: ComponentFixture<PermisoRolRecursoCrearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermisoRolRecursoCrearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermisoRolRecursoCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
