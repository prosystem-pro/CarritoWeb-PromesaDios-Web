import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecursoEditarComponent } from './recurso-editar.component';

describe('RecursoEditarComponent', () => {
  let component: RecursoEditarComponent;
  let fixture: ComponentFixture<RecursoEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecursoEditarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecursoEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
