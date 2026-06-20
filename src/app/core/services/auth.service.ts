import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UsuarioSesion } from '../model/auth.model';
export type { LoginRequest, LoginResponse, UsuarioSesion } from '../model/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth/login`;
  private readonly http = inject(HttpClient)

  private readonly rolActual = new BehaviorSubject<string>(
    this.normalizarRol(localStorage.getItem('rol') || '')
  );
  readonly rolActual$ = this.rolActual.asObservable();

  private readonly usuarioActual = new BehaviorSubject<UsuarioSesion | null>(this.cargarUsuarioDesdeStorage());
  readonly usuarioActual$ = this.usuarioActual.asObservable();

  obtenerRolActual(): string {
    return this.rolActual.value;
  }

  obtenerUsuarioActual(): UsuarioSesion | null {
    return this.usuarioActual.value;
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('token') && !!this.rolActual.value;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    this.limpiarSesion();
    return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
      tap(response => this.guardarSesion(response))
    );
  }

  logout(): void {
    this.limpiarSesion();
  }

  private guardarSesion(response: LoginResponse): void {
    const rolNormalizado = this.normalizarRol(response.rol);
    const usuario: UsuarioSesion = {
      id: response.id, // Se captura el ID que ahora envía Spring Boot
      username: response.username,
      nombreCompleto: response.nombreCompleto || response.username,
      rol: rolNormalizado
    };

    localStorage.setItem('token', response.token);
    localStorage.setItem('id', usuario.id.toString()); // Se guarda en memoria persistente
    localStorage.setItem('rol', usuario.rol);
    localStorage.setItem('username', usuario.username);
    localStorage.setItem('nombreCompleto', usuario.nombreCompleto);

    this.rolActual.next(usuario.rol);
    this.usuarioActual.next(usuario);
  }

  private limpiarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('id'); // Se limpia el ID al cerrar sesión
    localStorage.removeItem('rol');
    localStorage.removeItem('username');
    localStorage.removeItem('nombreCompleto');
    this.rolActual.next('');
    this.usuarioActual.next(null);
  }

  private cargarUsuarioDesdeStorage(): UsuarioSesion | null {
    const idStr = localStorage.getItem('id');
    const rol = this.normalizarRol(localStorage.getItem('rol') || '');
    const username = localStorage.getItem('username') || '';
    const nombreCompleto = localStorage.getItem('nombreCompleto') || username;

    // Validación estricta: Si falta el ID, la sesión no está completa
    if (!rol || !username || !idStr) {
      return null;
    }

    return { 
      id: parseInt(idStr, 10), // Se convierte nuevamente a numérico
      username, 
      nombreCompleto, 
      rol 
    };
  }

  private normalizarRol(rol: string): string {
    return rol.startsWith('ROLE_') ? rol.slice(5) : rol;
  }
}