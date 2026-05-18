// ============================================================
// medicamento.service.ts
// Servicio HTTP para el catálogo de medicamentos
// Ubicación: src/app/core/services/medicamento.service.ts
// ============================================================

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MedicamentoResponse,
  MedicamentoRequest,
  CategoriaResponse,
  PageResponse,
  HistorialMedicamento
} from '../../features/farmacia/farmacia.models';

@Injectable({ providedIn: 'root' })
export class MedicamentoService {

  private readonly API = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // ── Consulta ────────────────────────────────────────────────

  buscar(params: {
    nombre?: string;
    codigo?: string;
    categoriaId?: number;
    soloActivos?: boolean;
    soloStockBajo?: boolean;
    pagina?: number;
    tamano?: number;
    ordenarPor?: string;
  }): Observable<PageResponse<MedicamentoResponse>> {
    let httpParams = new HttpParams();
    if (params.nombre)      httpParams = httpParams.set('nombre', params.nombre);
    if (params.codigo)      httpParams = httpParams.set('codigo', params.codigo);
    if (params.categoriaId) httpParams = httpParams.set('categoriaId', params.categoriaId.toString());
    httpParams = httpParams.set('soloActivos', (params.soloActivos ?? true).toString());
    httpParams = httpParams.set('pagina',     (params.pagina ?? 0).toString());
    httpParams = httpParams.set('tamano',     (params.tamano ?? 20).toString());
    if (params.ordenarPor)  httpParams = httpParams.set('ordenarPor', params.ordenarPor);

    return this.http.get<PageResponse<MedicamentoResponse>>(
      `${this.API}/medicamentos`, { params: httpParams }
    );
  }

  obtenerPorId(id: number): Observable<MedicamentoResponse> {
    return this.http.get<MedicamentoResponse>(`${this.API}/medicamentos/${id}`);
  }

  stockBajo(pagina = 0, tamano = 20): Observable<PageResponse<MedicamentoResponse>> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamano', tamano.toString());
    return this.http.get<PageResponse<MedicamentoResponse>>(
      `${this.API}/medicamentos/stock-bajo`, { params }
    );
  }

  listarCategorias(): Observable<CategoriaResponse[]> {
    return this.http.get<CategoriaResponse[]>(`${this.API}/categorias`);
  }

  historial(id: number, pagina = 0, tamano = 20): Observable<any> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamano', tamano.toString());
    return this.http.get(`${this.API}/medicamentos/${id}/historial`, { params });
  }

  // ── Gestión (solo ADMIN) ─────────────────────────────────────

  registrar(dto: MedicamentoRequest): Observable<MedicamentoResponse> {
    return this.http.post<MedicamentoResponse>(`${this.API}/medicamentos`, dto);
  }

  editar(id: number, dto: MedicamentoRequest): Observable<MedicamentoResponse> {
    return this.http.put<MedicamentoResponse>(`${this.API}/medicamentos/${id}`, dto);
  }

  inactivar(id: number): Observable<MedicamentoResponse> {
    return this.http.patch<MedicamentoResponse>(`${this.API}/medicamentos/${id}/inactivar`, {});
  }

  activar(id: number): Observable<MedicamentoResponse> {
    return this.http.patch<MedicamentoResponse>(`${this.API}/medicamentos/${id}/activar`, {});
  }
}