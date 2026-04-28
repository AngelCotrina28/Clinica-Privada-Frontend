import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trabajador } from '../model/trabajador.model'; // Ajusta la ruta a tu modelo

@Injectable({
  providedIn: 'root'
})
export class TrabajadorService {
  // La URL debe coincidir con el @RequestMapping de tu TrabajadorController en Java
  private apiUrl = 'http://localhost:8080/api/trabajadores';

  constructor(private http: HttpClient) { }

  // Método para obtener la lista del Criterio de Aceptación 1
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
    // Usamos patch como en el backend
    return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, {});
  }
}