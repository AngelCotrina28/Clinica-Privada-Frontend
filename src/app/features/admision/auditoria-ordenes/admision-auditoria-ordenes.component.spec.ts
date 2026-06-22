import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdmisionAuditoriaOrdenesComponent } from './admision-auditoria-ordenes.component';

const activatedRouteStub = {
  params: of({}),
  queryParams: of({}),
  snapshot: {
    paramMap: { get: () => null },
    queryParamMap: { get: () => null }
  }
};

describe('AdmisionAuditoriaOrdenesComponent', () => {
  let component: AdmisionAuditoriaOrdenesComponent;
  let fixture: ComponentFixture<AdmisionAuditoriaOrdenesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmisionAuditoriaOrdenesComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
      .overrideComponent(AdmisionAuditoriaOrdenesComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(AdmisionAuditoriaOrdenesComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
