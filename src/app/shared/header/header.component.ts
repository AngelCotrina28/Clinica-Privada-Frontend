import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UsuarioSesion } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() titulo = 'Resumen operativo';
  @Input() usuario = '';

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly usuarioActual$ = this.authService.usuarioActual$;
  readonly fechaActual = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  private trabajadorFallback = '';

  @Input('Trabajador')
  set trabajador(value: string) {
    this.trabajadorFallback = value;
  }

  nombreVisible(usuarioActual: UsuarioSesion | null): string {
    return usuarioActual?.nombreCompleto || this.usuario || this.trabajadorFallback || 'Usuario del sistema';
  }

  rolVisible(usuarioActual: UsuarioSesion | null): string {
    return this.formatearRol(usuarioActual?.rol || '');
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private formatearRol(rol: string): string {
    if (!rol) return 'Sesion activa';
    return rol
      .toLowerCase()
      .split('_')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }
}
