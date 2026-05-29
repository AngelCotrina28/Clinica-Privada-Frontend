import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Consultorio, ConsultorioRequest } from '../model/consultorio.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultorioService {
  private readonly apiUrl = `${environment.apiUrl}/consultorios`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<Consultorio[]> {
    return this.http.get<Consultorio[]>(this.apiUrl);
  }

  crear(request: ConsultorioRequest): Observable<Consultorio> {
    return this.http.post<Consultorio>(this.apiUrl, request);
  }

  actualizar(id: number, request: ConsultorioRequest): Observable<Consultorio> {
    return this.http.put<Consultorio>(`${this.apiUrl}/${id}`, request);
  }

  cambiarEstado(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, {});
  }
}
