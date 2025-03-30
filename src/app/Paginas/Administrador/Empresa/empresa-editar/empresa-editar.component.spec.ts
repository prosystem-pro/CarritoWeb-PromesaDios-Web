import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresaEditarComponent } from './empresa-editar.component';

describe('EmpresaEditarComponent', () => {
  let component: EmpresaEditarComponent;
  let fixture: ComponentFixture<EmpresaEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresaEditarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpresaEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
