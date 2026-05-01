export interface AbrirHistoriaRequest {
  dniPaciente:      string;
  nombreCompleto:   string;
  telefono?:        string;
  email?:           string;
  fechaNacimiento?: string;
  genero?:          string;
  direccion?:       string;
  desdeAdmision:    boolean;
}

export interface HistoriaClinicaResponse {
  id:               number;
  numeroHistoria:   string;
  dniPaciente:      string;
  nombreCompleto:   string;
  telefono?:        string;
  email?:           string;
  fechaNacimiento?: string;
  genero?:          string;
  creadoPor:        string;
  createdAt:        string;
  redirectUrl?:     string;
  nuevaHistoria:    boolean;
}

export interface MedicoDisponible {
  id:             number;
  nombreCompleto: string;
  especialidades: string[];
}

export interface GenerarOrdenRequest {
  historiaClinicaId: number | null;
  medicoId:          number | null;
  motivo?:           string;
}

export interface OrdenEmergenciaResponse {
  id:                 number;
  numeroOrden:        string;
  numeroHistoria:     string;
  dniPaciente:        string;
  nombrePaciente:     string;
  nombreMedico:       string;
  especialidadMedico: string;
  estado:             string;
  motivo?:            string;
  generadoPor:        string;
  createdAt:          string;
}

export interface CitaRequest {
  historiaClinicaId: number | null;
  especialidadId:    number | null;
  fechaHora:         string;
}