import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecursoListadoComponent } from './recurso-listado.component';

describe('RecursoListadoComponent', () => {
  let component: RecursoListadoComponent;
  let fixture: ComponentFixture<RecursoListadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecursoListadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecursoListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
