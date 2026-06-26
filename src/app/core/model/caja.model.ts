import { TipoComprobante } from './serie-comprobante.model';

export type ConceptoDeuda = 'TODOS' | 'GASTOS_CITA' | 'GASTOS_EMERGENCIA' | 'GASTOS_MEDICINA';
export type MetodoPago = 'EFECTIVO' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'TRANSFERENCIA';
export type EstadoCaja = 'ABIERTA' | 'CUADRADA' | 'CERRADA';
export type EstadoComprobante = 'EMITIDO' | 'ANULADO';

export interface Caja {
  id: number;
  nombre: string;
  ubicacion?: string | null;
  activo: boolean;
}

export interface Deuda {
  id: number;
  numeroOrden: string;
  concepto: Exclude<ConceptoDeuda, 'TODOS'>;
  conceptoLabel: string;
  monto: number;
  estado: string;
  pacienteId: number;
  pacienteDni: string;
  pacienteNombre: string;
  origenCodigo: string;
  fechaGeneracion?: string;
}

export interface DeudaSeleccionable extends Deuda {
  checked: boolean;
}

export interface AperturaCaja {
  id: number;
  cajaId: number;
  cajaNombre: string;
  cajeroId: number;
  cajeroNombre: string;
  cajeroUsername: string;
  montoInicial: number;
  montoCierre?: number | null;
  diferencia?: number | null;
  estado: EstadoCaja;
  fechaApertura: string;
  fechaCierre?: string | null;
  totalEfectivo: number;
  totalTarjetas: number;
  totalBilleteras: number;
  totalIngresos: number;
  totalTeorico: number;
}

export interface PagoRequest {
  deudaIds: number[];
  metodoPago: MetodoPago;
  tipoComprobante: TipoComprobante;
  rucDni?: string;
  razonSocialNombre?: string;
  direccionFiscal?: string;
  referencia?: string;
}

export interface Comprobante {
  id: number;
  numeroCompleto: string;
  tipoComprobante: TipoComprobante;
  estado: EstadoComprobante;
  subtotal: number;
  igv: number;
  total: number;
  pacienteDni: string;
  pacienteNombre: string;
  emitidoPor: string;
  metodoPago: MetodoPago;
  fechaEmision?: string;
  deudas: Deuda[];
}

export interface AsignacionCaja {
  id: number;
  cajeroId: number;
  cajeroNombre: string;
  cajeroUsername: string;
  cajaId: number;
  cajaNombre: string;
  cajaUbicacion?: string | null;
  serieBoletaId: number;
  serieBoleta: string;
  serieFacturaId: number;
  serieFactura: string;
  activo: boolean;
  fechaAsignacion?: string;
}

export interface AsignacionCajaRequest {
  cajeroId: number;
  cajaId?: number | null;
  cajaNombre: string;
  cajaUbicacion?: string;
  serieBoletaId: number;
  serieFacturaId: number;
  activo?: boolean;
}

export interface TrabajadorCaja {
  id: number;
  dni: string;
  nombreCompleto: string;
  username: string;
  nombreRol: string;
  activo: boolean;
}
