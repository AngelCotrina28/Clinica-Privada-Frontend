import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    username: string;
    rol: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private rolActual = new BehaviorSubject<string>(localStorage.getItem('rol') || '');
    rolActual$ = this.rolActual.asObservable();
    private http = inject(HttpClient);

    private apiUrl = 'http://localhost:8080/api/auth/login';

    obtenerRolActual(): string {
        return this.rolActual.value;
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
            tap((response) => {
                localStorage.setItem('token', response.token);
                localStorage.setItem('rol', response.rol);

                this.rolActual.next(response.rol);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        this.rolActual.next('');
    }
}