import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SerieComprobante, SerieComprobanteRequest } from '../model/serie-comprobante.model';

@Injectable({
  providedIn: 'root'
})
export class SerieComprobanteService {
  private readonly apiUrl = `${environment.apiUrl}/series-comprobantes`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<SerieComprobante[]> {
    return this.http.get<SerieComprobante[]>(this.apiUrl);
  }

  crear(request: SerieComprobanteRequest): Observable<SerieComprobante> {
    return this.http.post<SerieComprobante>(this.apiUrl, request);
  }

  actualizar(id: number, request: SerieComprobanteRequest): Observable<SerieComprobante> {
    return this.http.put<SerieComprobante>(`${this.apiUrl}/${id}`, request);
  }

  cambiarEstado(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, {});
  }
}
