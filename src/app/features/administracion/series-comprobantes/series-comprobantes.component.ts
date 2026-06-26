import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SerieComprobante, SerieComprobanteRequest, TipoComprobante } from '../../../core/model/serie-comprobante.model';
import { SerieComprobanteService } from '../../../core/services/serie-comprobante.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { controlErrorMessage, integerValidator, patternValidator } from '../../../core/validators/form-validations';

@Component({
  selector: 'app-series-comprobantes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './series-comprobantes.component.html',
  styleUrl: './series-comprobantes.component.scss'
})
export class SeriesComprobantesComponent implements OnInit {
  series: SerieComprobante[] = [];
  serieForm: FormGroup;

  tiposComprobante: Array<{ value: TipoComprobante; label: string }> = [
    { value: 'BOLETA', label: 'Boleta' },
    { value: 'FACTURA', label: 'Factura' }
  ];

  busqueda = '';
  tipoFiltro = '';
  mostrarInactivas = false;
  isModalOpen = false;
  isEditMode = false;
  idSeleccionado: number | null = null;
  cargando = false;
  mensaje = '';
  error = '';

  constructor(
    private fb: FormBuilder,
    private serieService: SerieComprobanteService
  ) {
    this.serieForm = this.fb.group({
      tipoComprobante: ['', [Validators.required]],
      prefijo: ['', [
        Validators.required,
        Validators.maxLength(4),
        patternValidator(/^[A-Za-z][0-9]{3}$/, 'pattern')
      ]],
      numeroInicial: [1, [Validators.required, Validators.min(1), Validators.max(999999), integerValidator()]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarSeries();
  }

  get seriesFiltradas(): SerieComprobante[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.series.filter(serie => {
      const coincideEstado = this.mostrarInactivas || serie.activo;
      const coincideTipo = !this.tipoFiltro || serie.tipoComprobante === this.tipoFiltro;
      const coincideTexto = !texto || [
        serie.tipoComprobante,
        serie.prefijo,
        serie.siguienteNumero
      ].some(valor => valor.toLowerCase().includes(texto));

      return coincideEstado && coincideTipo && coincideTexto;
    });
  }

  cargarSeries(): void {
    this.cargando = true;
    this.serieService.listarTodos().subscribe({
      next: data => {
        this.series = data;
        this.cargando = false;
      },
      error: e => {
        this.error = this.obtenerMensajeError(e, 'No se pudieron cargar las series.');
        this.cargando = false;
      }
    });
  }

  abrirModalCrear(): void {
    this.limpiarMensajes();
    this.isEditMode = false;
    this.idSeleccionado = null;
    this.serieForm.reset({
      tipoComprobante: 'BOLETA',
      prefijo: 'B001',
      numeroInicial: 1,
      activo: true
    });
    this.isModalOpen = true;
  }

  prepararEdicion(serie: SerieComprobante): void {
    this.limpiarMensajes();
    this.isEditMode = true;
    this.idSeleccionado = serie.id;
    this.serieForm.reset({
      tipoComprobante: serie.tipoComprobante,
      prefijo: serie.prefijo,
      numeroInicial: serie.siguienteCorrelativo,
      activo: serie.activo
    });
    this.isModalOpen = true;
  }

  guardar(): void {
    this.normalizarPrefijo();
    if (this.serieForm.invalid) {
      this.serieForm.markAllAsTouched();
      return;
    }

    const errorTipoPrefijo = this.validarPrefijoContraTipo();
    if (errorTipoPrefijo) {
      this.error = errorTipoPrefijo;
      return;
    }

    this.limpiarMensajes();
    const payload = this.payload();
    const operacion = this.isEditMode && this.idSeleccionado
      ? this.serieService.actualizar(this.idSeleccionado, payload)
      : this.serieService.crear(payload);

    operacion.subscribe({
      next: () => {
        this.mensaje = this.isEditMode ? 'Serie actualizada.' : 'Serie registrada.';
        this.cerrarModal();
        this.cargarSeries();
      },
      error: e => this.error = this.obtenerMensajeError(e, 'No se pudo guardar la serie.')
    });
  }

  cambiarEstado(serie: SerieComprobante): void {
    const accion = serie.activo ? 'desactivar' : 'reactivar';
    if (!confirm(`Seguro que deseas ${accion} la serie ${serie.prefijo}?`)) return;

    this.limpiarMensajes();
    this.serieService.cambiarEstado(serie.id).subscribe({
      next: () => {
        this.mensaje = serie.activo ? 'Serie desactivada.' : 'Serie reactivada.';
        this.cargarSeries();
      },
      error: e => this.error = this.obtenerMensajeError(e, 'No se pudo cambiar el estado de la serie.')
    });
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.idSeleccionado = null;
  }

  normalizarPrefijo(): void {
    const control = this.serieForm.get('prefijo');
    const valor = control?.value;
    if (typeof valor === 'string') {
      control?.setValue(valor.trim().toUpperCase(), { emitEvent: false });
    }
  }

  sugerirPrefijo(): void {
    if (this.isEditMode) return;
    const tipo = this.serieForm.get('tipoComprobante')?.value as TipoComprobante;
    const prefijo = this.serieForm.get('prefijo')?.value;
    if (prefijo && prefijo !== 'B001' && prefijo !== 'F001') return;
    this.serieForm.get('prefijo')?.setValue(tipo === 'FACTURA' ? 'F001' : 'B001');
  }

  campoInvalido(nombre: string): boolean {
    const control = this.serieForm.get(nombre);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  mensajeCampo(nombre: string, etiqueta: string): string {
    return controlErrorMessage(this.serieForm.get(nombre), etiqueta);
  }

  tipoLabel(tipo: TipoComprobante): string {
    return this.tiposComprobante.find(t => t.value === tipo)?.label ?? tipo;
  }

  private payload(): SerieComprobanteRequest {
    const form = this.serieForm.value;
    return {
      tipoComprobante: form.tipoComprobante,
      prefijo: String(form.prefijo).trim().toUpperCase(),
      numeroInicial: Number(form.numeroInicial),
      activo: !!form.activo
    };
  }

  private validarPrefijoContraTipo(): string {
    const form = this.payload();
    if (form.tipoComprobante === 'BOLETA' && !form.prefijo.startsWith('B')) {
      return 'Las series de boleta deben iniciar con B. Ejemplo: B001.';
    }
    if (form.tipoComprobante === 'FACTURA' && !form.prefijo.startsWith('F')) {
      return 'Las series de factura deben iniciar con F. Ejemplo: F001.';
    }
    return '';
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
