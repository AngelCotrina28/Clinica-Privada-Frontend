import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AperturaCaja,
  AsignacionCaja,
  AsignacionCajaRequest,
  Caja,
  Comprobante,
  ConceptoDeuda,
  Deuda,
  PagoRequest,
  TrabajadorCaja
} from '../model/caja.model';

@Injectable({
  providedIn: 'root'
})
export class CajaService {
  private readonly apiUrl = `${environment.apiUrl}/caja`;

  constructor(private http: HttpClient) { }

  obtenerAperturaActual(): Observable<AperturaCaja | null> {
    return this.http.get<AperturaCaja | null>(`${this.apiUrl}/apertura-actual`);
  }

  abrirCaja(montoInicial: number): Observable<AperturaCaja> {
    return this.http.post<AperturaCaja>(`${this.apiUrl}/aperturas`, { montoInicial });
  }

  buscarDeudas(dni: string, concepto: ConceptoDeuda): Observable<Deuda[]> {
    let params = new HttpParams().set('dni', dni.trim());
    if (concepto !== 'TODOS') {
      params = params.set('concepto', concepto);
    }
    return this.http.get<Deuda[]>(`${this.apiUrl}/deudas`, { params });
  }

  emitirComprobante(request: PagoRequest): Observable<Comprobante> {
    return this.http.post<Comprobante>(`${this.apiUrl}/pagos`, request);
  }

  cuadrarCaja(dineroContado: number, observaciones?: string): Observable<AperturaCaja> {
    return this.http.post<AperturaCaja>(`${this.apiUrl}/cuadre`, { dineroContado, observaciones });
  }

  listarCajas(): Observable<Caja[]> {
    return this.http.get<Caja[]>(`${this.apiUrl}/cajas`);
  }

  listarCajeros(): Observable<TrabajadorCaja[]> {
    return this.http.get<TrabajadorCaja[]>(`${this.apiUrl}/cajeros`);
  }

  listarAsignaciones(): Observable<AsignacionCaja[]> {
    return this.http.get<AsignacionCaja[]>(`${this.apiUrl}/asignaciones`);
  }

  crearAsignacion(request: AsignacionCajaRequest): Observable<AsignacionCaja> {
    return this.http.post<AsignacionCaja>(`${this.apiUrl}/asignaciones`, request);
  }

  actualizarAsignacion(id: number, request: AsignacionCajaRequest): Observable<AsignacionCaja> {
    return this.http.put<AsignacionCaja>(`${this.apiUrl}/asignaciones/${id}`, request);
  }

  cambiarEstadoAsignacion(id: number, activo: boolean): Observable<AsignacionCaja> {
    const params = new HttpParams().set('activo', activo);
    return this.http.patch<AsignacionCaja>(`${this.apiUrl}/asignaciones/${id}/estado`, {}, { params });
  }

  listarCuadresPendientes(): Observable<AperturaCaja[]> {
    return this.http.get<AperturaCaja[]>(`${this.apiUrl}/cuadres-pendientes`);
  }

  cerrarCaja(aperturaId: number): Observable<AperturaCaja> {
    return this.http.post<AperturaCaja>(`${this.apiUrl}/cierres/${aperturaId}`, {});
  }

  listarComprobantes(): Observable<Comprobante[]> {
    return this.http.get<Comprobante[]>(`${this.apiUrl}/comprobantes`);
  }

  anularComprobante(id: number, motivo: string): Observable<Comprobante> {
    return this.http.post<Comprobante>(`${this.apiUrl}/comprobantes/${id}/anular`, { motivo });
  }
}
