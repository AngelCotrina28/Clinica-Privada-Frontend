export type TipoComprobante = 'BOLETA' | 'FACTURA';

export interface SerieComprobante {
  id: number;
  tipoComprobante: TipoComprobante;
  prefijo: string;
  correlativoActual: number;
  siguienteCorrelativo: number;
  siguienteNumero: string;
  activo: boolean;
}

export interface SerieComprobanteRequest {
  tipoComprobante: TipoComprobante;
  prefijo: string;
  numeroInicial: number;
  activo?: boolean;
}
