// ============================================================
// farmacia.models.ts
// Modelos tipados del módulo Farmacia
// ============================================================

export interface MedicamentoResponse {
  id: number;
  codigo: string;
  nombre: string;
  nombreGenerico: string;
  descripcion: string;
  categoriaId: number;
  categoriaNombre: string;
  presentacion: string;
  laboratorio: string;
  precioUnitario: number;
  stockActual: number;
  stockMinimo: number;
  requiereReceta: boolean;
  activo: boolean;
  creadoPor: string;
  createdAt: string;
  updatedAt: string;
  stockBajo: boolean;
}

export interface MedicamentoRequest {
  codigo: string;
  nombre: string;
  nombreGenerico?: string;
  descripcion?: string;
  categoriaId: number;
  presentacion?: string;
  laboratorio?: string;
  precioUnitario: number;
  stockInicial: number;
  stockMinimo?: number;
  requiereReceta: boolean;
}

export interface CategoriaResponse {
  id: number;
  nombre: string;
}

export interface PageResponse<T> {
  contenido: T[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  ultima: boolean;
}

export interface HistorialMedicamento {
  id: number;
  tipoOperacion: string;
  campoModificado: string;
  valorAnterior: string;
  valorNuevo: string;
  trabajador: string;
  fecha: string;
}