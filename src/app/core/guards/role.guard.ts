import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const rolActual = authService.obtenerRolActual();
    const rolesPermitidos = route.data['roles'] as Array<string>;

    if (rolesPermitidos && !rolesPermitidos.includes(rolActual)) {
        router.navigate(['/login']);
        return false;
    }
    return true;
};