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

// 1. Interfaz para la vista del Frontend (Tabla y Autocomplete)
export interface ItemReceta {
    medicamentoId: number;
    medicamentoNombre: string;
    dias: number;
    cantidad: number;
    indicaciones: string;
}

// 2. Interfaz estructurada para el envío (Payload) al Backend
export interface ItemRecetaRequest {
    medicamentoId: number;
    dias: number;
    cantidad: number;
    indicaciones: string;
}

// 3. Interfaz del request principal actualizada
export interface AtencionMedicaRequest {
    historiaClinicaId: number;
    numeroCita?: string;
    diagnosticoPrincipal: string;
    notasEvolucion?: string;
    medicoId?: number;
    itemsReceta?: ItemRecetaRequest[]; // Se enlaza a la nueva interfaz de request
}