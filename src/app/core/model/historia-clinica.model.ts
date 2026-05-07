export interface HistoriaClinicaResponse {
    id: number;
    numeroHistoria: string;
    dniPaciente: string;
    nombreCompleto: string;
    telefono: string;
    email: string;
    fechaNacimiento: string;
    genero: string;
    direccion: string;
    creadoPor: string;
    createdAt: string;
    redirectUrl?: string;
    nuevaHistoria: boolean;
}