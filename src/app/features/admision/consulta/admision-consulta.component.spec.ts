import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdmisionConsultaComponent } from './admision-consulta.component';

const activatedRouteStub = {
  params: of({}),
  queryParams: of({}),
  snapshot: {
    paramMap: { get: () => null },
    queryParamMap: { get: () => null }
  }
};

describe('AdmisionConsultaComponent', () => {
  let component: AdmisionConsultaComponent;
  let fixture: ComponentFixture<AdmisionConsultaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmisionConsultaComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
      .overrideComponent(AdmisionConsultaComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(AdmisionConsultaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
