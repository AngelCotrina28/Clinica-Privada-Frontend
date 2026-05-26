import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Especialidad } from '../model/especialidad.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  private apiUrl = `${environment.apiUrl}/especialidades`;

  constructor(private http: HttpClient) { }

  listar(): Observable<Especialidad[]> {
    return this.http.get<Especialidad[]>(this.apiUrl);
  }
}