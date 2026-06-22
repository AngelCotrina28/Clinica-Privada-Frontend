import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HistoriaClinicaService } from './historia-clinica.service';

describe('HistoriaClinicaService', () => {
  let service: HistoriaClinicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(HistoriaClinicaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
