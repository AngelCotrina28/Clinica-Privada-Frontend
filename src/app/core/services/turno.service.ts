import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TurnoRequest, TurnoResponse } from '../../features/admision/admision.models';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  private readonly apiUrl = 'http://localhost:8080/api/turnos';

  constructor(private http: HttpClient) { }

  listar(especialidadId: number | null, anio: number, mes: number): Observable<TurnoResponse[]> {
    let params = new HttpParams()
      .set('anio', anio)
      .set('mes', mes);
    if (especialidadId) {
      params = params.set('especialidadId', especialidadId);
    }
    return this.http.get<TurnoResponse[]>(this.apiUrl, { params });
  }

  crear(turno: TurnoRequest): Observable<TurnoResponse> {
    return this.http.post<TurnoResponse>(this.apiUrl, turno);
  }

  actualizar(id: number, turno: TurnoRequest): Observable<TurnoResponse> {
    return this.http.put<TurnoResponse>(`${this.apiUrl}/${id}`, turno);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
