import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

const RUTAS_INICIO_POR_ROL: Record<string, string> = {
    'MEDICO': '/atencion-medica',
    'TECNICO_FARMACIA': '/farmacia',
    'CAJERO': '/caja-facturacion',
    'RECEPCIONISTA': '/admision/consulta',
    'ENFERMERO': '/admision/historias',
    'JEFE_ENFERMERIA': '/admision/historias',
    'ADMINISTRADOR': '/dashboard'
};

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
    showPassword = false;

    private authService = inject(AuthService);
    private router = inject(Router);

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    onLogin() {
        this.errorMessage = '';

        this.authService.login(this.credentials).subscribe({
            next: (response) => {
                const rutaDestino = RUTAS_INICIO_POR_ROL[response.rol] || '/dashboard';
                this.router.navigate([rutaDestino]);
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
}
