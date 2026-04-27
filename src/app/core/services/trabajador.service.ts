import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrabajadorService {
  // Ajusta el puerto si tu Spring Boot corre en otro distinto al 8080
  private apiUrl = 'http://localhost:8080/api/Trabajadors';

  constructor(private http: HttpClient) { }

  listarTrabajadors(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  registrarTrabajador(Trabajador: any): Observable<any> {
    return this.http.post(this.apiUrl, Trabajador);
  }
}