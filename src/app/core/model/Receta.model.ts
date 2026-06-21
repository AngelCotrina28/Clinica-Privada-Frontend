export interface DetalleRecetaResponse {
    id: number;
    medicamentoId: number;
    medicamentoNombre: string;
    presentacion?: string;
    dosis?: string;
    frecuencia?: string;
    duracion?: string;
    cantidadPrescrita: number;
    cantidadDespachada: number;
    viaAdministracion?: string;
    indicaciones?: string;
}

export interface RecetaResponse {
    id: number;
    numeroReceta: string;
    pacienteNombre: string;
    pacienteDni: string;
    medicoNombre: string;
    indicacionesGenerales?: string;
    estado: 'EMITIDA' | 'DESPACHADA' | 'PARCIAL' | 'ANULADA';
    fechaEmision: string;
    fechaVencimiento?: string;
    detalles: DetalleRecetaResponse[];
    yaDespachada?: boolean;
}