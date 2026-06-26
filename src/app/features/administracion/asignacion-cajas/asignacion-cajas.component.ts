import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AperturaCaja,
  AsignacionCaja,
  AsignacionCajaRequest,
  Caja,
  Comprobante,
  TrabajadorCaja
} from '../../../core/model/caja.model';
import { SerieComprobante } from '../../../core/model/serie-comprobante.model';
import { CajaService } from '../../../core/services/caja.service';
import { SerieComprobanteService } from '../../../core/services/serie-comprobante.service';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-asignacion-cajas',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './asignacion-cajas.component.html',
  styleUrl: './asignacion-cajas.component.scss'
})
export class AsignacionCajasComponent implements OnInit {
  asignaciones: AsignacionCaja[] = [];
  cajas: Caja[] = [];
  cajeros: TrabajadorCaja[] = [];
  series: SerieComprobante[] = [];
  cuadresPendientes: AperturaCaja[] = [];
  comprobantes: Comprobante[] = [];

  busqueda = '';
  mostrarInactivas = false;
  cargando = false;
  mensaje = '';
  error = '';
  editandoId: number | null = null;

  form = this.formInicial();

  constructor(
    private cajaService: CajaService,
    private serieService: SerieComprobanteService
  ) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  get seriesBoleta(): SerieComprobante[] {
    return this.series.filter(serie => serie.activo && serie.tipoComprobante === 'BOLETA');
  }

  get seriesFactura(): SerieComprobante[] {
    return this.series.filter(serie => serie.activo && serie.tipoComprobante === 'FACTURA');
  }

  get asignacionesFiltradas(): AsignacionCaja[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.asignaciones.filter(asignacion => {
      const estadoOk = this.mostrarInactivas || asignacion.activo;
      const textoOk = !texto || [
        asignacion.cajeroNombre,
        asignacion.cajeroUsername,
        asignacion.cajaNombre,
        asignacion.serieBoleta,
        asignacion.serieFactura
      ].some(valor => valor.toLowerCase().includes(texto));
      return estadoOk && textoOk;
    });
  }

  cargarDatos(): void {
    this.cargando = true;
    this.cargarAsignaciones();
    this.cargarCajas();
    this.cargarCajeros();
    this.cargarSeries();
    this.cargarCuadres();
    this.cargarComprobantes();
    this.cargando = false;
  }

  cargarAsignaciones(): void {
    this.cajaService.listarAsignaciones().subscribe({
      next: data => this.asignaciones = data,
      error: e => this.error = this.obtenerMensajeError(e, 'No se pudieron cargar las asignaciones.')
    });
  }

  cargarCajas(): void {
    this.cajaService.listarCajas().subscribe({
      next: data => this.cajas = data,
      error: e => this.error = this.obtenerMensajeError(e, 'No se pudieron cargar las cajas.')
    });
  }

  cargarCajeros(): void {
    this.cajaService.listarCajeros().subscribe({
      next: data => this.cajeros = data,
      error: e => this.error = this.obtenerMensajeError(e, 'No se pudieron cargar los cajeros.')
    });
  }

  cargarSeries(): void {
    this.serieService.listarTodos().subscribe({
      next: data => this.series = data,
      error: e => this.error = this.obtenerMensajeError(e, 'No se pudieron cargar las series.')
    });
  }

  cargarCuadres(): void {
    this.cajaService.listarCuadresPendientes().subscribe({
      next: data => this.cuadresPendientes = data,
      error: e => this.error = this.obtenerMensajeError(e, 'No se pudieron cargar los cuadres.')
    });
  }

  cargarComprobantes(): void {
    this.cajaService.listarComprobantes().subscribe({
      next: data => this.comprobantes = data,
      error: e => this.error = this.obtenerMensajeError(e, 'No se pudieron cargar los comprobantes.')
    });
  }

  guardar(): void {
    this.limpiarMensajes();
    const payload = this.payload();
    if (!payload) return;

    const operacion = this.editandoId
      ? this.cajaService.actualizarAsignacion(this.editandoId, payload)
      : this.cajaService.crearAsignacion(payload);

    operacion.subscribe({
      next: () => {
        this.mensaje = this.editandoId ? 'Asignacion actualizada.' : 'Asignacion registrada.';
        this.cancelarEdicion();
        this.cargarAsignaciones();
        this.cargarCajas();
      },
      error: e => this.error = this.obtenerMensajeError(e, 'No se pudo guardar la asignacion.')
    });
  }

  prepararEdicion(asignacion: AsignacionCaja): void {
    this.limpiarMensajes();
    this.editandoId = asignacion.id;
    this.form = {
      cajeroId: asignacion.cajeroId,
      cajaId: asignacion.cajaId,
      cajaNombre: asignacion.cajaNombre,
      cajaUbicacion: asignacion.cajaUbicacion ?? '',
      serieBoletaId: asignacion.serieBoletaId,
      serieFacturaId: asignacion.serieFacturaId,
      activo: asignacion.activo
    };
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.form = this.formInicial();
  }

  cambiarEstado(asignacion: AsignacionCaja): void {
    const nuevoEstado = !asignacion.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    if (!confirm(`Seguro que deseas ${accion} la asignacion de ${asignacion.cajeroNombre}?`)) return;

    this.limpiarMensajes();
    this.cajaService.cambiarEstadoAsignacion(asignacion.id, nuevoEstado).subscribe({
      next: () => {
        this.mensaje = nuevoEstado ? 'Asignacion activada.' : 'Asignacion desactivada.';
        this.cargarAsignaciones();
      },
      error: e => this.error = this.obtenerMensajeError(e, 'No se pudo cambiar el estado.')
    });
  }

  cerrarCaja(apertura: AperturaCaja): void {
    if (!confirm(`Cerrar definitivamente la caja de ${apertura.cajeroNombre}?`)) return;

    this.limpiarMensajes();
    this.cajaService.cerrarCaja(apertura.id).subscribe({
      next: () => {
        this.mensaje = 'Caja cerrada definitivamente.';
        this.cargarCuadres();
      },
      error: e => this.error = this.obtenerMensajeError(e, 'No se pudo cerrar la caja.')
    });
  }

  anularComprobante(comprobante: Comprobante): void {
    const motivo = prompt(`Motivo de anulacion para ${comprobante.numeroCompleto}`);
    if (!motivo?.trim()) return;

    this.limpiarMensajes();
    this.cajaService.anularComprobante(comprobante.id, motivo.trim()).subscribe({
      next: () => {
        this.mensaje = 'Comprobante anulado. Las deudas asociadas vuelven a pendiente.';
        this.cargarComprobantes();
      },
      error: e => this.error = this.obtenerMensajeError(e, 'No se pudo anular el comprobante.')
    });
  }

  private payload(): AsignacionCajaRequest | null {
    if (!this.form.cajeroId || !this.form.serieBoletaId || !this.form.serieFacturaId) {
      this.error = 'Seleccione cajero, serie de boleta y serie de factura.';
      return null;
    }
    if (!this.form.cajaId && !this.form.cajaNombre.trim()) {
      this.error = 'Ingrese el nombre de la caja.';
      return null;
    }

    return {
      cajeroId: Number(this.form.cajeroId),
      cajaId: this.form.cajaId ? Number(this.form.cajaId) : null,
      cajaNombre: this.form.cajaNombre.trim() || this.nombreCajaSeleccionada(),
      cajaUbicacion: this.form.cajaUbicacion.trim(),
      serieBoletaId: Number(this.form.serieBoletaId),
      serieFacturaId: Number(this.form.serieFacturaId),
      activo: this.form.activo
    };
  }

  private nombreCajaSeleccionada(): string {
    return this.cajas.find(caja => caja.id === Number(this.form.cajaId))?.nombre ?? 'Caja';
  }

  private formInicial() {
    return {
      cajeroId: null as number | null,
      cajaId: null as number | null,
      cajaNombre: '',
      cajaUbicacion: '',
      serieBoletaId: null as number | null,
      serieFacturaId: null as number | null,
      activo: true
    };
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
