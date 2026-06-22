import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CajaFacturacionComponent } from './caja-facturacion.component';

const activatedRouteStub = {
  params: of({}),
  queryParams: of({}),
  snapshot: {
    paramMap: { get: () => null },
    queryParamMap: { get: () => null }
  }
};

describe('CajaFacturacionComponent', () => {
  let component: CajaFacturacionComponent;
  let fixture: ComponentFixture<CajaFacturacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaFacturacionComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
      .overrideComponent(CajaFacturacionComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(CajaFacturacionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
