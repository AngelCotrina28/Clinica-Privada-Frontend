export interface Trabajador {
  id: number;
  dni: string;
  nombreCompleto: string;
  username: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  colegiatura: string;
  rolId: number;
  nombreRol: string;
  activo: boolean;
}