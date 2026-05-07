import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AtencionMedicaHistorial } from '../model/atencion-medica.model';
import { HistoriaClinicaResponse } from '../model/historia-clinica.model';

@Injectable({
    providedIn: 'root'
})
export class AtencionMedicaService {

    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/atenciones';

    // --- NUEVO: GESTIÓN DE ESTADO (MEMORIA COMPARTIDA) ---
    private pacienteActivoSource = new BehaviorSubject<HistoriaClinicaResponse | null>(null);
    pacienteActivo$ = this.pacienteActivoSource.asObservable();

    setPacienteActivo(paciente: HistoriaClinicaResponse | null) {
        this.pacienteActivoSource.next(paciente);
    }
    // ----------------------------------------------------

    obtenerHistorialPaciente(historiaId: number): Observable<AtencionMedicaHistorial[]> {
        return this.http.get<AtencionMedicaHistorial[]>(`${this.apiUrl}/historial/${historiaId}`);
    }
}