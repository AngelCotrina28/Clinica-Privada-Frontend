import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RegistroResultadosComponent } from './registro-resultados.component';

const activatedRouteStub = {
  params: of({}),
  queryParams: of({}),
  snapshot: {
    paramMap: { get: () => null },
    queryParamMap: { get: () => null }
  }
};

describe('RegistroResultadosComponent', () => {
  let component: RegistroResultadosComponent;
  let fixture: ComponentFixture<RegistroResultadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroResultadosComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
      .overrideComponent(RegistroResultadosComponent, { set: { template: '', imports: [] } })
      .compileComponents();

    fixture = TestBed.createComponent(RegistroResultadosComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
