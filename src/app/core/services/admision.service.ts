import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    ActualizarHistoriaRequest,
    AbrirHistoriaRequest,
    GenerarOrdenRequest,
    HistoriaClinicaResponse,
    MedicoDisponible,
    OrdenEmergenciaResponse
} from '../model/admision.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdmisionService {
    private http = inject(HttpClient);

    private readonly apiUrl = `${environment.apiUrl}/admision`;

    // OBTENER MÉDICOS ACTIVOS
    cargarMedicos(): Observable<MedicoDisponible[]> {
        return this.http.get<MedicoDisponible[]>(`${environment.apiUrl}/trabajadores/medicos/activos`);
    }

    // OBTENER ÓRDENES DE HOY
    cargarOrdenesHoy(): Observable<OrdenEmergenciaResponse[]> {
        return this.http.get<OrdenEmergenciaResponse[]>(`${this.apiUrl}/emergencia/ordenes/hoy`);
    }

    // BUSCAR HISTORIA POR DNI
    buscarHistoria(dni: string): Observable<HistoriaClinicaResponse> {
        return this.http.get<HistoriaClinicaResponse>(
        `${this.apiUrl}/historia?dni=${encodeURIComponent(dni)}`
        );
    }

    // ABRIR NUEVA HISTORIA
    abrirNuevaHistoria(datos: AbrirHistoriaRequest): Observable<HistoriaClinicaResponse> {
        return this.http.post<HistoriaClinicaResponse>(`${this.apiUrl}/historia`, datos);
    }

    listarHistorias(): Observable<HistoriaClinicaResponse[]> {
        return this.http.get<HistoriaClinicaResponse[]>(`${this.apiUrl}/historias`);
    }

    actualizarHistoria(id: number, datos: ActualizarHistoriaRequest): Observable<HistoriaClinicaResponse> {
        return this.http.put<HistoriaClinicaResponse>(`${this.apiUrl}/historias/${id}`, datos);
    }

    // GENERAR ORDEN DE ATENCIÓN
    generarOrden(datos: GenerarOrdenRequest): Observable<OrdenEmergenciaResponse> {
        return this.http.post<OrdenEmergenciaResponse>(`${this.apiUrl}/emergencia/orden`, datos);
    }
}
