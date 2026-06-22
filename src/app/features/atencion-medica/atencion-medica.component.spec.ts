import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AtencionMedicaComponent } from './atencion-medica.component';

const activatedRouteStub = {
  params: of({}),
  queryParams: of({}),
  snapshot: {
    paramMap: { get: () => null },
    queryParamMap: { get: () => null }
  }
};

describe('AtencionMedicaComponent', () => {
  let component: AtencionMedicaComponent;
  let fixture: ComponentFixture<AtencionMedicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtencionMedicaComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
      .overrideComponent(AtencionMedicaComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(AtencionMedicaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
