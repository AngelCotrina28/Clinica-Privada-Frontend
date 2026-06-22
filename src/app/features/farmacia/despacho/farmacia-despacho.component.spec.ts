import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { FarmaciaDespachoComponent } from './farmacia-despacho.component';

const activatedRouteStub = {
  params: of({}),
  queryParams: of({}),
  snapshot: {
    paramMap: { get: () => null },
    queryParamMap: { get: () => null }
  }
};

describe('FarmaciaDespachoComponent', () => {
  let component: FarmaciaDespachoComponent;
  let fixture: ComponentFixture<FarmaciaDespachoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmaciaDespachoComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
      .overrideComponent(FarmaciaDespachoComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(FarmaciaDespachoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
