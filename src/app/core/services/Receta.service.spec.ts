import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RecetaService } from './Receta.service';

describe('RecetaService', () => {
  let service: RecetaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(RecetaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
