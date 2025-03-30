import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecursoCrearComponent } from './recurso-crear.component';

describe('RecursoCrearComponent', () => {
  let component: RecursoCrearComponent;
  let fixture: ComponentFixture<RecursoCrearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecursoCrearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecursoCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
