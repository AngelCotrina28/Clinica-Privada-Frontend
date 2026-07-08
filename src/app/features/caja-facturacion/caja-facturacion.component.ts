import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AperturaCaja,
  Comprobante,
  ConceptoDeuda,
  DeudaSeleccionable,
  MetodoPago,
  PagoRequest
} from '../../core/model/caja.model';
import { TipoComprobante } from '../../core/model/serie-comprobante.model';
import { CajaService } from '../../core/services/caja.service';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-caja-facturacion',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FormsModule],
  templateUrl: './caja-facturacion.component.html',
  styleUrl: './caja-facturacion.component.scss'
})
export class CajaFacturacionComponent implements OnInit {
  aperturaActual: AperturaCaja | null = null;
  deudas: DeudaSeleccionable[] = [];
  ultimoComprobante: Comprobante | null = null;
  comprobanteParaImprimir: Comprobante | null = null;

  dniBusqueda = '';
  conceptoFiltro: ConceptoDeuda = 'TODOS';
  montoInicial = 0;
  dineroContado = 0;
  observacionesCuadre = '';

  metodoPago: MetodoPago = 'EFECTIVO';
  tipoComprobante: TipoComprobante = 'BOLETA';
  rucDni = '';
  razonSocialNombre = '';
  direccionFiscal = '';
  referencia = '';

  cargandoApertura = false;
  cargandoDeudas = false;
  procesandoPago = false;
  procesandoCuadre = false;
  mensaje = '';
  error = '';

  metodosPago: Array<{ value: MetodoPago; label: string }> = [
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'TARJETA_DEBITO', label: 'Tarjeta' },
    { value: 'TRANSFERENCIA', label: 'Yape/Plin' }
  ];

  tiposComprobante: Array<{ value: TipoComprobante; label: string }> = [
    { value: 'BOLETA', label: 'Boleta' },
    { value: 'FACTURA', label: 'Factura' }
  ];

  conceptosDeuda: Array<{ value: ConceptoDeuda; label: string }> = [
    { value: 'TODOS', label: 'Todos' },
    { value: 'GASTOS_EMERGENCIA', label: 'Gastos de emergencia' },
    { value: 'GASTOS_CITA', label: 'Gastos de cita' },
    { value: 'GASTOS_MEDICINA', label: 'Gastos de medicina' }
  ];

  constructor(private cajaService: CajaService) { }

  ngOnInit(): void {
    this.cargarAperturaActual();
  }

  get cajaAbierta(): boolean {
    return this.aperturaActual?.estado === 'ABIERTA';
  }

  get cajaCuadrada(): boolean {
    return this.aperturaActual?.estado === 'CUADRADA';
  }

  get deudasSeleccionadas(): DeudaSeleccionable[] {
    return this.deudas.filter(deuda => deuda.checked);
  }

  get totalSeleccionado(): number {
    return this.deudasSeleccionadas.reduce((sum, deuda) => sum + Number(deuda.monto), 0);
  }

  get todasSeleccionadas(): boolean {
    return this.deudas.length > 0 && this.deudas.every(deuda => deuda.checked);
  }

  cargarAperturaActual(): void {
    this.cargandoApertura = true;
    this.cajaService.obtenerAperturaActual().subscribe({
      next: apertura => {
        this.aperturaActual = apertura;
        this.dineroContado = apertura?.totalTeorico ?? 0;
        this.cargandoApertura = false;
      },
      error: e => {
        this.error = this.obtenerMensajeError(e, 'No se pudo cargar la caja actual.');
        this.cargandoApertura = false;
      }
    });
  }

  abrirCaja(): void {
    this.limpiarMensajes();
    if (this.montoInicial < 0) {
      this.error = 'El monto inicial debe ser mayor o igual a S/ 0.00.';
      return;
    }

    this.cargandoApertura = true;
    this.cajaService.abrirCaja(Number(this.montoInicial)).subscribe({
      next: apertura => {
        this.aperturaActual = apertura;
        this.dineroContado = apertura.totalTeorico;
        this.mensaje = 'Caja abierta correctamente.';
        this.cargandoApertura = false;
      },
      error: e => {
        this.error = this.obtenerMensajeError(e, 'No se pudo abrir la caja.');
        this.cargandoApertura = false;
      }
    });
  }

  buscarDeudas(): void {
    this.limpiarMensajes();
    const criterio = this.dniBusqueda.trim();
    if (!criterio) {
      this.error = 'Ingrese DNI o numero de historia clinica.';
      return;
    }

    this.cargandoDeudas = true;
    this.ultimoComprobante = null;
    this.cajaService.buscarDeudas(criterio, this.conceptoFiltro).subscribe({
      next: deudas => {
        this.deudas = deudas.map(deuda => ({ ...deuda, checked: false }));
        this.mensaje = deudas.length ? '' : 'El paciente no tiene deudas pendientes para ese filtro.';
        this.cargandoDeudas = false;
      },
      error: e => {
        this.error = this.obtenerMensajeError(e, 'No se pudieron buscar las deudas.');
        this.cargandoDeudas = false;
      }
    });
  }

  alternarTodas(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.deudas = this.deudas.map(deuda => ({ ...deuda, checked }));
  }

  emitirComprobante(): void {
    this.limpiarMensajes();
    if (!this.cajaAbierta) {
      this.error = 'Debe tener una caja abierta para procesar pagos.';
      return;
    }
    if (!this.deudasSeleccionadas.length) {
      this.error = 'Seleccione al menos una deuda pendiente.';
      return;
    }

    const request: PagoRequest = {
      deudaIds: this.deudasSeleccionadas.map(deuda => deuda.id),
      metodoPago: this.metodoPago,
      tipoComprobante: this.tipoComprobante,
      rucDni: this.rucDni || undefined,
      razonSocialNombre: this.razonSocialNombre || undefined,
      direccionFiscal: this.direccionFiscal || undefined,
      referencia: this.referencia || undefined
    };

    this.procesandoPago = true;
    this.cajaService.emitirComprobante(request).subscribe({
      next: comprobante => {
        const pagadas = new Set(request.deudaIds);
        this.ultimoComprobante = comprobante;
        this.deudas = this.deudas.filter(deuda => !pagadas.has(deuda.id));
        this.mensaje = `Comprobante ${comprobante.numeroCompleto} emitido.`;
        this.procesandoPago = false;
        this.cargarAperturaActual();
      },
      error: e => {
        this.error = this.obtenerMensajeError(e, 'No se pudo emitir el comprobante.');
        this.procesandoPago = false;
      }
    });
  }

  cuadrarCaja(): void {
    this.limpiarMensajes();
    if (!this.cajaAbierta) {
      this.error = 'Solo se puede cuadrar una caja abierta.';
      return;
    }
    if (this.dineroContado < 0) {
      this.error = 'El dinero contado debe ser mayor o igual a S/ 0.00.';
      return;
    }

    this.procesandoCuadre = true;
    this.cajaService.cuadrarCaja(Number(this.dineroContado), this.observacionesCuadre).subscribe({
      next: apertura => {
        this.aperturaActual = apertura;
        this.mensaje = 'Cuadre registrado. La caja ya no puede emitir comprobantes.';
        this.procesandoCuadre = false;
      },
      error: e => {
        this.error = this.obtenerMensajeError(e, 'No se pudo cuadrar la caja.');
        this.procesandoCuadre = false;
      }
    });
  }

  estadoDiferencia(apertura: AperturaCaja): string {
    const diferencia = Number(apertura.diferencia ?? 0);
    if (diferencia === 0) return 'Cuadre exacto';
    return diferencia > 0 ? 'Sobrante' : 'Faltante';
  }

  diferenciaAbsoluta(apertura: AperturaCaja): number {
    return Math.abs(Number(apertura.diferencia ?? 0));
  }

  imprimirComprobante(): void {
    if (!this.ultimoComprobante) return;
    this.comprobanteParaImprimir = this.ultimoComprobante;
    setTimeout(() => {
      window.print();
      this.comprobanteParaImprimir = null;
    }, 80);
  }

  private limpiarMensajes(): void {
    this.mensaje = '';
    this.error = '';
  }

  private obtenerMensajeError(error: any, fallback: string): string {
    return error?.error?.mensaje
      ?? error?.message
      ?? fallback;
  }
}
