import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trabajador } from '../model/trabajador.model';
import { CitaRequest, CitaResponse, HorarioBloque } from '../model/admision.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private readonly apiUrl = `${environment.apiUrl}/citas`;

  constructor(private http: HttpClient) { }

  listarMedicosPorEspecialidad(especialidadId: number): Observable<Trabajador[]> {
    const params = new HttpParams().set('especialidadId', especialidadId.toString());
    return this.http.get<Trabajador[]>(`${this.apiUrl}/medicos`, { params });
  }

  obtenerDisponibilidad(medicoId: number, fecha: string): Observable<HorarioBloque[]> {
    const params = new HttpParams()
      .set('medicoId', medicoId.toString())
      .set('fecha', fecha);
    return this.http.get<HorarioBloque[]>(`${this.apiUrl}/disponibilidad`, { params });
  }

  consultarDisponibilidadMensual(medicoId: number, fechaInicio: string, fechaFin: string): Observable<any[]> {
    const params = new HttpParams()
      .set('medicoId', medicoId.toString())
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<any[]>(`${this.apiUrl}/disponibilidad/mensual`, { params });
  }

  programar(cita: CitaRequest): Observable<CitaResponse> {
    return this.http.post<CitaResponse>(this.apiUrl, cita);
  }

  crear(cita: any): Observable<any> {
    return this.programar(cita);
  }
}