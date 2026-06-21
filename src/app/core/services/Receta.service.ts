import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RecetaResponse } from '../model/Receta.model';

@Injectable({ providedIn: 'root' })
export class RecetaService {
    private readonly baseUrl = `${environment.apiUrl}/recetas`;

    constructor(private http: HttpClient) {}

    buscar(termino: string): Observable<RecetaResponse[]> {
    return this.http.get<RecetaResponse[]>(`${this.baseUrl}/buscar`, {
        params: { termino }
    });
    }
    
    despachar(recetaId: number): Observable<RecetaResponse> {
    return this.http.patch<RecetaResponse>(`${this.baseUrl}/${recetaId}/despachar`, {});
    }
}