import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { FarmaciaInventarioComponent } from './farmacia-inventario.component';

const activatedRouteStub = {
  params: of({}),
  queryParams: of({}),
  snapshot: {
    paramMap: { get: () => null },
    queryParamMap: { get: () => null }
  }
};

describe('FarmaciaInventarioComponent', () => {
  let component: FarmaciaInventarioComponent;
  let fixture: ComponentFixture<FarmaciaInventarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmaciaInventarioComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
      .overrideComponent(FarmaciaInventarioComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(FarmaciaInventarioComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
