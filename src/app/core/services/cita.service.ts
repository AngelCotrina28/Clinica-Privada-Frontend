import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CitaService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:8080/api/citas';

crear(cita: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, cita);
}

obtenerDisponibilidad(medicoId: number, fechaInicio: string, fechaFin: string): Observable<any[]> {
    const params = new HttpParams()
    .set('medicoId', medicoId.toString())
    .set('fechaInicio', fechaInicio)
    .set('fechaFin', fechaFin);

    return this.http.get<any[]>(`${this.apiUrl}/disponibilidad`, { params });
}
}