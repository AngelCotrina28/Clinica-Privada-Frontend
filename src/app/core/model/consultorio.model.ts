export interface Consultorio {
  id: number;
  nombre: string;
  numero?: string | null;
  piso?: string | null;
  especialidadId?: number | null;
  especialidad: string;
  activo: boolean;
}

export interface ConsultorioRequest {
  nombre: string;
  numero?: string | null;
  piso?: string | null;
  especialidadId?: number | null;
  activo?: boolean;
}
