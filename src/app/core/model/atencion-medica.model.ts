export interface AtencionMedicaHistorial {
    id: number;
    fechaHoraInicio: string;
    medicoNombre: string;
    motivoConsulta: string;
    anamnesis: string;
    examenFisico: string;
    diagnosticoPrincipal: string;
    diagnosticoSecundario?: string;
    tratamiento: string;
}

export interface AtencionMedicaRequest {
    historiaClinicaId: number;
    numeroCita?: string;
    diagnosticoPrincipal: string;
    notasEvolucion?: string;
    medicoId: number;
}
