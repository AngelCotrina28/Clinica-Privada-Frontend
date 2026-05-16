import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);
  const esAuth = req.url.includes('/api/auth/');
  
  if (token && !esAuth) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        localStorage.removeItem('username');
        localStorage.removeItem('nombreCompleto');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
