import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoriaClinicaResponse } from '../model/historia-clinica.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class HistoriaClinicaService {

    private http = inject(HttpClient);

    private apiUrl = `${environment.apiUrl}/admision`;

    buscarPorDni(dni: string): Observable<HistoriaClinicaResponse> {
        const params = new HttpParams().set('dni', dni);
        return this.http.get<HistoriaClinicaResponse>(`${this.apiUrl}/historia`, { params });
    }

    buscarPorNumeroHistoria(numeroHistoria: string): Observable<HistoriaClinicaResponse> {
        const params = new HttpParams().set('numeroHistoria', numeroHistoria);
        return this.http.get<HistoriaClinicaResponse>(`${this.apiUrl}/historia/numero`, { params });
    }
}