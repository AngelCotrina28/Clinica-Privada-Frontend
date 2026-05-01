import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    // Importamos FormsModule para poder usar ngModel en el HTML
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: [] // Puedes crear un login.component.scss más adelante y enlazarlo aquí
})
export class LoginComponent {
    // Aquí guardaremos lo que el usuario escriba en las cajas de texto
    credentials = {
        username: '',
        password: ''
    };

    // Variable para mostrar mensajes de error si se equivoca de clave
    errorMessage = '';

    // Inyectamos nuestro servicio y el enrutador para cambiar de página
    private authService = inject(AuthService);
    private router = inject(Router);

    onLogin() {
        this.errorMessage = '';

        this.authService.login(this.credentials).subscribe({
            next: (response) => {
                // Criterio 1: Redirección
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                // Leemos el mensaje exacto que nos envía el backend (err.error.mensaje)
                if (err.error && err.error.mensaje) {
                    this.errorMessage = err.error.mensaje;
                } else {
                    // Por si falla la red o el servidor está apagado
                    this.errorMessage = 'Credenciales incorrectas';
                }
            }
        });
    }
}