import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ConsultoriosComponent } from './consultorios.component';

const activatedRouteStub = {
  params: of({}),
  queryParams: of({}),
  snapshot: {
    paramMap: { get: () => null },
    queryParamMap: { get: () => null }
  }
};

describe('ConsultoriosComponent', () => {
  let component: ConsultoriosComponent;
  let fixture: ComponentFixture<ConsultoriosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultoriosComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
      .overrideComponent(ConsultoriosComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(ConsultoriosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
