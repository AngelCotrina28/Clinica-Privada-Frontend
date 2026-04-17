import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Admision } from './admision';

describe('Admision', () => {
  let component: Admision;
  let fixture: ComponentFixture<Admision>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admision],
    }).compileComponents();

    fixture = TestBed.createComponent(Admision);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
