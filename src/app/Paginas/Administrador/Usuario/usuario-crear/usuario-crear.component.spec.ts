import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioCrearComponent } from './usuario-crear.component';

describe('UsuarioCrearComponent', () => {
  let component: UsuarioCrearComponent;
  let fixture: ComponentFixture<UsuarioCrearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioCrearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuarioCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
