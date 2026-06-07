import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AtencionMedicaHistorial, AtencionMedicaRequest } from '../model/atencion-medica.model';
import { HistoriaClinicaResponse } from '../model/historia-clinica.model';
import { environment } from '../../../environments/environment';
export interface CitaOpcion {
  codigo: string;
  tipo:   'CITA' | 'EMERGENCIA';
  fecha:  string;
}

@Injectable({
  providedIn: 'root'
})

    export class AtencionMedicaService {

        private http = inject(HttpClient);
        private apiUrl = `${environment.apiUrl}/atenciones`;

        private pacienteActivoSource = new BehaviorSubject<HistoriaClinicaResponse | null>(null);
        pacienteActivo$ = this.pacienteActivoSource.asObservable();

        private _medicoNombre: string | null = null;

        getMedicoNombre(): string | null {
            return this._medicoNombre;
        }
        
        setMedicoNombre(nombre: string): void {
            this._medicoNombre = nombre;
        }

        setPacienteActivo(paciente: HistoriaClinicaResponse | null) {
            this.pacienteActivoSource.next(paciente);
        }

        obtenerHistorialPaciente(historiaId: number): Observable<AtencionMedicaHistorial[]> {
            return this.http.get<AtencionMedicaHistorial[]>(`${this.apiUrl}/historial/${historiaId}`);
        }

        registrarAtencion(datos: AtencionMedicaRequest): Observable<number> {
            return this.http.post<number>(`${this.apiUrl}/registro`, datos);
        }


        obtenerCitasDisponibles(historiaId: number): Observable<CitaOpcion[]> {
            return this.http.get<CitaOpcion[]>(`${this.apiUrl}/citas-disponibles/${historiaId}`);
        }
    }