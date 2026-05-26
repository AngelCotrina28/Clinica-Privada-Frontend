import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trabajador } from '../model/trabajador.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrabajadorService {
  private apiUrl = `${environment.apiUrl}/trabajadores`;

  constructor(private http: HttpClient) { }

  listarTodos(): Observable<Trabajador[]> {
    return this.http.get<Trabajador[]>(this.apiUrl);
  }

  crear(trabajador: any): Observable<Trabajador> {
    return this.http.post<Trabajador>(this.apiUrl, trabajador);
  }

  actualizar(id: number, trabajador: any): Observable<Trabajador> {
    return this.http.put<Trabajador>(`${this.apiUrl}/${id}`, trabajador);
  }

  cambiarEstado(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, {});
  }

  getMedicosActivos(): Observable<Trabajador[]> {
    return this.http.get<Trabajador[]>(`${this.apiUrl}/medicos/activos`);
  }
}