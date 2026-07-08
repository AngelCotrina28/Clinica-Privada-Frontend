import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Especialidad } from '../../../core/model/especialidad.model';
import { Consultorio } from '../../../core/model/consultorio.model';
import { ConsultorioService } from '../../../core/services/consultorio.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { controlErrorMessage, FORM_PATTERNS, patternValidator } from '../../../core/validators/form-validations';

@Component({
  selector: 'app-consultorios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './consultorios.component.html',
  styleUrl: './consultorios.component.scss'
})
export class ConsultoriosComponent implements OnInit {
  consultorios: Consultorio[] = [];
  especialidades: Especialidad[] = [];
  consultorioForm: FormGroup;

  busqueda = '';
  especialidadFiltro = '';
  mostrarInactivos = false;
  isModalOpen = false;
  isEditMode = false;
  idSeleccionado: number | null = null;
  cargando = false;
  mensaje = '';
  error = '';
  readonly pisos = ['1', '2', '3', '4', '5'];

  constructor(
    private fb: FormBuilder,
    private consultorioService: ConsultorioService,
    private especialidadService: EspecialidadService
  ) {
    this.consultorioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100), patternValidator(FORM_PATTERNS.codigoSimple, 'pattern')]],
      numero: ['', [Validators.maxLength(10), patternValidator(FORM_PATTERNS.entero, 'integer')]],
      piso: ['', [patternValidator(/^[1-5]$/, 'pattern')]],
      especialidadId: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarConsultorios();
    this.especialidadService.listar().subscribe({
      next: data => this.especialidades = data,
      error: e => this.error = this.obtenerMensajeError(e, 'No se pudieron cargar las especialidades.')
    });
  }

  get consultoriosFiltrados(): Consultorio[] {
    const texto = this.busqueda.trim().toLowerCase();
    return this.consultorios.filter(c => {
      const coincideEstado = this.mostrarInactivos || c.activo;
      const coincideEspecialidad = !this.especialidadFiltro
        || String(c.especialidadId ?? '') === this.especialidadFiltro;
      const coincideTexto = !texto || [
        c.nombre,
        c.numero,
        c.piso,
        c.especialidad
      ].some(valor => valor?.toLowerCase().includes(texto));

      return coincideEstado && coincideEspecialidad && coincideTexto;
    });
  }

  cargarConsultorios(): void {
    this.cargando = true;
    this.consultorioService.listarTodos().subscribe({
      next: data => {
        this.consultorios = data;
        this.cargando = false;
      },
      error: e => {
        this.error = this.obtenerMensajeError(e, 'No se pudieron cargar los consultorios.');
        this.cargando = false;
      }
    });
  }

  abrirModalCrear(): void {
    this.limpiarMensajes();
    this.isEditMode = false;
    this.idSeleccionado = null;
    this.consultorioForm.reset({
      nombre: '',
      numero: '',
      piso: '',
      especialidadId: '',
      activo: true
    });
    this.isModalOpen = true;
  }

  prepararEdicion(consultorio: Consultorio): void {
    this.limpiarMensajes();
    this.isEditMode = true;
    this.idSeleccionado = consultorio.id;
    this.consultorioForm.reset({
      nombre: consultorio.nombre,
      numero: consultorio.numero ?? '',
      piso: consultorio.piso ?? '',
      especialidadId: consultorio.especialidadId ? String(consultorio.especialidadId) : '',
      activo: consultorio.activo
    });
    this.isModalOpen = true;
  }

  guardar(): void {
    if (this.consultorioForm.invalid) {
      this.consultorioForm.markAllAsTouched();
      return;
    }

    this.limpiarMensajes();
    const payload = this.payload();
    const operacion = this.isEditMode && this.idSeleccionado
      ? this.consultorioService.actualizar(this.idSeleccionado, payload)
      : this.consultorioService.crear(payload);

    operacion.subscribe({
      next: () => {
        this.mensaje = this.isEditMode ? 'Consultorio actualizado.' : 'Consultorio registrado.';
        this.cerrarModal();
        this.cargarConsultorios();
      },
      error: e => this.error = this.obtenerMensajeError(e, 'No se pudo guardar el consultorio.')
    });
  }

  cambiarEstado(consultorio: Consultorio): void {
    const accion = consultorio.activo ? 'desactivar' : 'reactivar';
    if (!confirm(`Seguro que deseas ${accion} este consultorio?`)) return;

    this.limpiarMensajes();
    this.consultorioService.cambiarEstado(consultorio.id).subscribe({
      next: () => {
        this.mensaje = consultorio.activo ? 'Consultorio desactivado.' : 'Consultorio reactivado.';
        this.cargarConsultorios();
      },
      error: e => this.error = this.obtenerMensajeError(e, 'No se pudo cambiar el estado del consultorio.')
    });
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.idSeleccionado = null;
  }

  private payload() {
    const form = this.consultorioForm.value;
    return {
      nombre: form.nombre,
      numero: form.numero || null,
      piso: form.piso || null,
      especialidadId: form.especialidadId ? Number(form.especialidadId) : null,
      activo: !!form.activo
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

  campoInvalido(nombre: string): boolean {
    const control = this.consultorioForm.get(nombre);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  mensajeCampo(nombre: string, etiqueta: string): string {
    return controlErrorMessage(this.consultorioForm.get(nombre), etiqueta);
  }

  pisoVisible(piso: string | null | undefined): string {
    if (!piso) return '-';
    return /^\d+$/.test(piso) ? `Piso ${piso}` : piso;
  }
}
