import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  nombreCompleto: string;
  rol: string;
}

export interface UsuarioSesion {
  username: string;
  nombreCompleto: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/auth/login';
  private readonly http = inject(HttpClient);

  private readonly rolActual = new BehaviorSubject<string>(localStorage.getItem('rol') || '');
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
    const usuario: UsuarioSesion = {
      username: response.username,
      nombreCompleto: response.nombreCompleto || response.username,
      rol: response.rol
    };

    localStorage.setItem('token', response.token);
    localStorage.setItem('rol', usuario.rol);
    localStorage.setItem('username', usuario.username);
    localStorage.setItem('nombreCompleto', usuario.nombreCompleto);

    this.rolActual.next(usuario.rol);
    this.usuarioActual.next(usuario);
  }

  private limpiarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('username');
    localStorage.removeItem('nombreCompleto');
    this.rolActual.next('');
    this.usuarioActual.next(null);
  }

  private cargarUsuarioDesdeStorage(): UsuarioSesion | null {
    const rol = localStorage.getItem('rol') || '';
    const username = localStorage.getItem('username') || '';
    const nombreCompleto = localStorage.getItem('nombreCompleto') || username;

    if (!rol || !username) {
      return null;
    }

    return { username, nombreCompleto, rol };
  }
}
