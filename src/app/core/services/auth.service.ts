import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UsuarioSesion } from '../model/auth.model';
import { StorageService } from './storage.service';
export type { LoginRequest, LoginResponse, UsuarioSesion } from '../model/auth.model';

interface JwtPayload {
  sub?: string;
  username?: string;
  names?: string;
  nombreCompleto?: string;
  rol?: string;
  exp?: number;
  id?: number | string;
  trabajadorId?: number | string;
  userId?: number | string;
}

type DatosUsuarioSesion = Partial<UsuarioSesion> & Partial<LoginResponse>;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly accessTokenKey = 'accessToken';
  private readonly legacyTokenKey = 'token';
  private readonly refreshTokenKey = 'refreshToken';
  private readonly usuarioSesionKey = 'usuarioSesion';
  private readonly apiUrl = `${environment.apiUrl}/auth/login`;
  private readonly http = inject(HttpClient);
  private readonly storageService = inject(StorageService);

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

  obtenerToken(): string | null {
    return this.storageService.getString(this.accessTokenKey) ?? this.storageService.getString(this.legacyTokenKey);
  }

  obtenerRefreshToken(): string | null {
    return this.storageService.getString(this.refreshTokenKey);
  }

  estaAutenticado(): boolean {
    const token = this.obtenerToken();
    if (!token) return false;

    const payload = this.decodificarToken(token);
    if (!payload || this.tokenExpirado(payload)) {
      this.limpiarSesion();
      return false;
    }

    return !!this.rolActual.value;
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
    const accessToken = this.obtenerAccessToken(response);
    if (!accessToken) {
      this.limpiarSesion();
      return;
    }

    this.storageService.setString(this.accessTokenKey, accessToken, {
      cookie: true,
      maxAgeSeconds: 60 * 60 * 8
    });
    this.storageService.remove(this.legacyTokenKey);

    if (response.refreshToken) {
      this.storageService.setString(this.refreshTokenKey, response.refreshToken, {
        cookie: true,
        maxAgeSeconds: 60 * 60 * 24 * 7
      });
    } else {
      this.storageService.remove(this.refreshTokenKey);
    }

    const usuario = this.crearUsuarioSesion(response, accessToken);
    if (usuario) {
      this.storageService.setObject(this.usuarioSesionKey, usuario);
      this.rolActual.next(usuario.rol);
      this.usuarioActual.next(usuario);
      return;
    }

    this.limpiarStorage();
  }

  private limpiarSesion(): void {
    this.limpiarStorage();
    this.rolActual.next('');
    this.usuarioActual.next(null);
  }

  private cargarUsuarioDesdeStorage(): UsuarioSesion | null {
    const token = this.obtenerToken();
    if (!token) return null;

    const payload = this.decodificarToken(token);
    if (!payload || this.tokenExpirado(payload)) {
      this.limpiarStorage();
      return null;
    }

    if (this.storageService.getString(this.legacyTokenKey)) {
      this.storageService.setString(this.accessTokenKey, token, {
        cookie: true,
        maxAgeSeconds: 60 * 60 * 8
      });
      this.storageService.remove(this.legacyTokenKey);
    }

    const usuarioGuardado = this.storageService.getObject<UsuarioSesion>(this.usuarioSesionKey);
    const usuario = this.crearUsuarioSesion(usuarioGuardado ?? {}, token);
    if (!usuario) {
      this.limpiarStorage();
      return null;
    }

    return usuario;
  }

  private crearUsuarioSesion(datos: DatosUsuarioSesion, token: string): UsuarioSesion | null {
    const decodedToken = this.decodificarToken(token);
    if (!decodedToken || this.tokenExpirado(decodedToken)) return null;

    const id = this.obtenerNumero(datos.id, decodedToken.id, decodedToken.trabajadorId, decodedToken.userId);
    const username = datos.username || decodedToken.username || decodedToken.sub || '';
    const nombreCompleto = datos.nombreCompleto || decodedToken.nombreCompleto || decodedToken.names || username;
    const rol = this.normalizarRol(datos.rol || decodedToken.rol || '');

    if (!id || !username || !rol) return null;

    return { id, username, nombreCompleto, rol };
  }

  private decodificarToken(token: string): JwtPayload | null {
    try {
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

  private tokenExpirado(payload: JwtPayload): boolean {
    return !!payload.exp && payload.exp * 1000 < Date.now();
  }

  private obtenerNumero(...valores: Array<number | string | undefined>): number | null {
    for (const valor of valores) {
      const numero = typeof valor === 'number' ? valor : Number(valor);
      if (Number.isFinite(numero) && numero > 0) return numero;
    }

    return null;
  }

  private obtenerAccessToken(response: LoginResponse): string | null {
    return response.accessToken || response.token || null;
  }

  private limpiarStorage(): void {
    this.storageService.remove(this.accessTokenKey);
    this.storageService.remove(this.legacyTokenKey);
    this.storageService.remove(this.refreshTokenKey);
    this.storageService.remove(this.usuarioSesionKey);
  }

  private normalizarRol(rol: string): string {
    return rol.startsWith('ROLE_') ? rol.slice(5) : rol;
  }
}
