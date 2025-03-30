import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpresaCrearComponent } from './empresa-crear.component';

describe('EmpresaCrearComponent', () => {
  let component: EmpresaCrearComponent;
  let fixture: ComponentFixture<EmpresaCrearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresaCrearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpresaCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
