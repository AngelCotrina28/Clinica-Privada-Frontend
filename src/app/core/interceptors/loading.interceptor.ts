import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // 1. Apenas la petición intenta salir, encendemos el aviso
  loadingService.show();

  // 2. Dejamos que la petición continúe su viaje hacia Spring Boot
  return next(req).pipe(
    // 3. El operador finalize garantiza al 100% que el aviso se apagará, 
    // sin importar si el servidor responde con éxito o con un error.
    finalize(() => loadingService.hide())
  );
};
