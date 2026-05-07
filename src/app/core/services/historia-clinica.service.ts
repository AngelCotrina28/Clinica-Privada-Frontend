import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoriaClinicaResponse } from '../model/historia-clinica.model';

@Injectable({
    providedIn: 'root'
})
export class HistoriaClinicaService {

    private http = inject(HttpClient);

    // Apuntamos al controlador de Admisión que ya tiene los endpoints de Historia
    private apiUrl = 'http://localhost:8080/api/admision';

    /**
     * Busca una historia clínica utilizando el DNI del paciente.
     */
    buscarPorDni(dni: string): Observable<HistoriaClinicaResponse> {
        const params = new HttpParams().set('dni', dni);
        return this.http.get<HistoriaClinicaResponse>(`${this.apiUrl}/historia`, { params });
    }

    /**
     * Busca una historia clínica utilizando el Número de Historia.
     */
    buscarPorNumeroHistoria(numeroHistoria: string): Observable<HistoriaClinicaResponse> {
        const params = new HttpParams().set('numeroHistoria', numeroHistoria);
        return this.http.get<HistoriaClinicaResponse>(`${this.apiUrl}/historia/numero`, { params });
    }
}