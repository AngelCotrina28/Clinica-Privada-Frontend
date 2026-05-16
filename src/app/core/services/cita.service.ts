import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trabajador } from '../model/trabajador.model';
import { CitaRequest, CitaResponse, HorarioBloque } from '../../features/admision/admision.models';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private readonly apiUrl = 'http://localhost:8080/api/citas';

  constructor(private http: HttpClient) { }

  listarMedicosPorEspecialidad(especialidadId: number): Observable<Trabajador[]> {
    const params = new HttpParams().set('especialidadId', especialidadId);
    return this.http.get<Trabajador[]>(`${this.apiUrl}/medicos`, { params });
  }

  obtenerDisponibilidad(medicoId: number, fecha: string): Observable<HorarioBloque[]> {
    const params = new HttpParams()
      .set('medicoId', medicoId)
      .set('fecha', fecha);
    return this.http.get<HorarioBloque[]>(`${this.apiUrl}/disponibilidad`, { params });
  }

  programar(cita: CitaRequest): Observable<CitaResponse> {
    return this.http.post<CitaResponse>(this.apiUrl, cita);
  }
}
