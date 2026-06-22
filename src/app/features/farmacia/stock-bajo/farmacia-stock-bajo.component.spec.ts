import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { FarmaciaStockBajoComponent } from './farmacia-stock-bajo.component';

const activatedRouteStub = {
  params: of({}),
  queryParams: of({}),
  snapshot: {
    paramMap: { get: () => null },
    queryParamMap: { get: () => null }
  }
};

describe('FarmaciaStockBajoComponent', () => {
  let component: FarmaciaStockBajoComponent;
  let fixture: ComponentFixture<FarmaciaStockBajoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmaciaStockBajoComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
      .overrideComponent(FarmaciaStockBajoComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(FarmaciaStockBajoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
