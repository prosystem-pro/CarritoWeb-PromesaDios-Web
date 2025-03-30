import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisoListadoComponent } from './permiso-listado.component';

describe('PermisoListadoComponent', () => {
  let component: PermisoListadoComponent;
  let fixture: ComponentFixture<PermisoListadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermisoListadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermisoListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
