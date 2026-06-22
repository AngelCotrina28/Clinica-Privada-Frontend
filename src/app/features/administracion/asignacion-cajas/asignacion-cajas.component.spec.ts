import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AsignacionCajasComponent } from './asignacion-cajas.component';

const activatedRouteStub = {
  params: of({}),
  queryParams: of({}),
  snapshot: {
    paramMap: { get: () => null },
    queryParamMap: { get: () => null }
  }
};

describe('AsignacionCajasComponent', () => {
  let component: AsignacionCajasComponent;
  let fixture: ComponentFixture<AsignacionCajasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignacionCajasComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
      .overrideComponent(AsignacionCajasComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(AsignacionCajasComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
