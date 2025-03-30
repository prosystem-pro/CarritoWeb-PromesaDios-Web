import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresaListadoComponent } from './empresa-listado.component';

describe('EmpresaListadoComponent', () => {
  let component: EmpresaListadoComponent;
  let fixture: ComponentFixture<EmpresaListadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresaListadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpresaListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
