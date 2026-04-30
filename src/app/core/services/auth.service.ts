import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
  // Simulamos que el usuario logueado es un Cajero. 
  // Cambia este valor para probar las diferentes vistas.
    private rolActual = new BehaviorSubject<string>('CAJERO'); 
    rolActual$ = this.rolActual.asObservable();

    obtenerRolActual(): string {
        return this.rolActual.value;
    }
}