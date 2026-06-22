import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AtencionMedicaService } from './atencion-medica.service';

describe('AtencionMedicaService', () => {
  let service: AtencionMedicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(AtencionMedicaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
