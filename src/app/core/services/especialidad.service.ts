import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Especialidad } from '../model/especialidad.model';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  // La ruta de tu backend que devuelve las especialidades
  private apiUrl = 'http://localhost:8080/api/especialidades';

  constructor(private http: HttpClient) { }

  listar(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(this.apiUrl);
  }
}