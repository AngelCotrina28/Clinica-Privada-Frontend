import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    credentials = {
        username: '',
        password: ''
    };

    errorMessage = '';

    private authService = inject(AuthService);
    private router = inject(Router);

    onLogin() {
        this.errorMessage = '';

        this.authService.login(this.credentials).subscribe({
            next: (response) => {
                // Delegamos la decisión de a qué pantalla ir según el rol
                this.redirigirSegunRol(response.rol);
            },
            error: (err) => {
                if (err.error && err.error.detalle) {
                    this.errorMessage = `${err.error.mensaje}: ${err.error.detalle}`;
                } else if (err.error && err.error.mensaje) {
                    this.errorMessage = err.error.mensaje;
                } else {
                    this.errorMessage = 'Credenciales incorrectas';
                }
            }
        });
    }

    /**
     * Módulo de enrutamiento inteligente.
     * Centraliza la lógica de "Aterrizaje" para cada tipo de trabajador.
     */
    private redirigirSegunRol(rol: string): void {
        switch (rol) {
            case 'MEDICO':
                this.router.navigate(['/atencion-medica']);
                break;
            case 'TECNICO_FARMACIA':
                this.router.navigate(['/farmacia']);
                break;
            case 'CAJERO':
                this.router.navigate(['/caja-facturacion']);
                break;
            case 'RECEPCIONISTA':
            case 'ENFERMERO':
            case 'JEFE_ENFERMERIA':
                this.router.navigate(['/admision/historias']);
                break;
            case 'ADMINISTRADOR':
            default:
                // El administrador y cualquier rol por defecto aterrizan en el Inicio
                this.router.navigate(['/dashboard']);
                break;
        }
    }
}
