import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = route => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.estaAutenticado()) {
    return router.createUrlTree(['/login']);
  }

  const rolActual = authService.obtenerRolActual();
  const rolesPermitidos = route.data['roles'] as string[] | undefined;

  if (rolesPermitidos?.length && !rolesPermitidos.includes(rolActual)) {
    return router.createUrlTree(['/login']);
  }

  return true;
};
