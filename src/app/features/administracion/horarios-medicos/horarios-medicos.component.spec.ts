import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { HorariosMedicosComponent } from './horarios-medicos.component';

const activatedRouteStub = {
  params: of({}),
  queryParams: of({}),
  snapshot: {
    paramMap: { get: () => null },
    queryParamMap: { get: () => null }
  }
};

describe('HorariosMedicosComponent', () => {
  let component: HorariosMedicosComponent;
  let fixture: ComponentFixture<HorariosMedicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorariosMedicosComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
      .overrideComponent(HorariosMedicosComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(HorariosMedicosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
