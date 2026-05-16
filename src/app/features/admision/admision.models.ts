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
  medicoId?:         number | null;
  fechaHora:         string;
  turnoId?:          number | null;
  consultorioId?:    number | null;
  motivoConsulta?:   string;
}

export interface HorarioBloque {
  turnoId:       number;
  consultorioId: number;
  consultorio:   string;
  horaInicio:    string;
  horaFin:       string;
  disponible:    boolean;
  estado:        string;
  citaId?:       number;
  numeroCita?:   string;
}

export interface CitaResponse {
  id:            number;
  numeroCita:    string;
  nombrePaciente: string;
  nombreMedico:  string;
  consultorio:   string;
  fechaHoraCita: string;
  estado:        string;
}

export interface TurnoRequest {
  medicoId:       number;
  especialidadId: number;
  fecha:          string;
  horaInicio:     string;
  horaFin:        string;
}

export interface TurnoResponse {
  id:            number;
  medicoId:      number;
  nombreMedico:  string;
  especialidadId: number | null;
  especialidad:  string;
  consultorioId: number;
  consultorio:   string;
  fecha:         string;
  diaSemana:     string;
  horaInicio:    string;
  horaFin:       string;
  activo:        boolean;
}
