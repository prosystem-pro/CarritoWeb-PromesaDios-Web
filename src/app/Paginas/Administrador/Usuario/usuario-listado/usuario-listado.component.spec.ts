import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioListadoComponent } from './usuario-listado.component';

describe('UsuarioListadoComponent', () => {
  let component: UsuarioListadoComponent;
  let fixture: ComponentFixture<UsuarioListadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioListadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuarioListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
