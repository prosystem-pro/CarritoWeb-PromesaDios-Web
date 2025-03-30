import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolListadoComponent } from './rol-listado.component';

describe('RolListadoComponent', () => {
  let component: RolListadoComponent;
  let fixture: ComponentFixture<RolListadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolListadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
