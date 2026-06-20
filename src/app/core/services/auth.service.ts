import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode'; // <-- HERRAMIENTA NUEVA
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UsuarioSesion } from '../model/auth.model';
export type { LoginRequest, LoginResponse, UsuarioSesion } from '../model/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth/login`;
  private readonly http = inject(HttpClient);

  private readonly usuarioActual = new BehaviorSubject<UsuarioSesion | null>(this.cargarUsuarioDesdeStorage());
  readonly usuarioActual$ = this.usuarioActual.asObservable();

  private readonly rolActual = new BehaviorSubject<string>(
    this.usuarioActual.value?.rol || ''
  );
  readonly rolActual$ = this.rolActual.asObservable();

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
      // pasamos el token
      tap(response => this.guardarSesion(response.token))
    );
  }

  logout(): void {
    this.limpiarSesion();
  }

  private guardarSesion(token: string): void {
    // Guardamos el token
    localStorage.setItem('token', token);

    // Extraemos el estado del token
    const usuario = this.extraerDatosDelToken(token);

    if (usuario) {
      this.rolActual.next(usuario.rol);
      this.usuarioActual.next(usuario);
    }
  }

  private limpiarSesion(): void {
    localStorage.removeItem('token');
    this.rolActual.next('');
    this.usuarioActual.next(null);
  }

  private cargarUsuarioDesdeStorage(): UsuarioSesion | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return this.extraerDatosDelToken(token);
  }

  private extraerDatosDelToken(token: string): UsuarioSesion | null {
    try {
      const decodedToken: any = jwtDecode(token);
      console.log('🔍 RADIOGRAFÍA DEL TOKEN:', decodedToken);

      const isExpired = decodedToken.exp && (decodedToken.exp * 1000 < Date.now());
      if (isExpired) {
        this.limpiarSesion();
        return null;
      }

      const rolString = decodedToken.rol;
      const rolNormalizado = this.normalizarRol(rolString);

      return {
        username: decodedToken.username || decodedToken.sub,
        nombreCompleto: decodedToken.names || decodedToken.sub,
        rol: rolNormalizado
      };
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      this.limpiarSesion();
      return null;
    }
  }

  private normalizarRol(rol: string): string {
    return rol.startsWith('ROLE_') ? rol.slice(5) : rol;
  }
}
