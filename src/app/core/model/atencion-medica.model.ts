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