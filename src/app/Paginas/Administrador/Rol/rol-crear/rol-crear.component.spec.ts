import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolCrearComponent } from './rol-crear.component';

describe('RolCrearComponent', () => {
  let component: RolCrearComponent;
  let fixture: ComponentFixture<RolCrearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolCrearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
