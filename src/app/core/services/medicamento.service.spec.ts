import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MedicamentoService } from './medicamento.service';

describe('MedicamentoService', () => {
  let service: MedicamentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(MedicamentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
