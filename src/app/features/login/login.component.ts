import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RUTAS_INICIO_POR_ROL, RUTA_POR_DEFECTO } from '../../core/config/role-routing';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    errorMessage = '';
    showPassword = false;
    cargando = false;

    loginForm = new FormGroup({
        username: new FormControl('', [
            Validators.required,
            Validators.minLength(4),
            Validators.pattern(/^[a-zA-Z0-9_.-]+$/)
        ]),
        password: new FormControl('', [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/^\S*$/)
        ])
    });

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    onLogin(): void {
        console.log(this.loginForm);
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.errorMessage = '';

        const credentials = {
            username: this.loginForm.value.username!,
            password: this.loginForm.value.password!
        };

        this.cargando = true;
        this.authService.login(credentials).subscribe({
            next: (response) => {
                const rolDelUsuario = this.authService.obtenerRolActual();
                const rutaDestino = RUTAS_INICIO_POR_ROL[rolDelUsuario] || RUTA_POR_DEFECTO;
                this.router.navigate([rutaDestino]);
            },
            error: (err) => {
                this.cargando = false;
                if (err.error && err.error.detalle) {
                    this.errorMessage = `${err.error.mensaje}: ${err.error.detalle}`;
                } else if (err.error && err.error.mensaje) {
                    this.errorMessage = err.error.mensaje;
                } else {
                    this.errorMessage = 'Credenciales incorrectas';
                }
            }, complete: () => {
                this.cargando = false;
            }
        });


    }
}
