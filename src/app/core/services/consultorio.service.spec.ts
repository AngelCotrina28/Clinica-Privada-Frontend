import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ConsultorioService } from './consultorio.service';

describe('ConsultorioService', () => {
  let service: ConsultorioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(ConsultorioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
