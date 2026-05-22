import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Especialidad } from '../../../core/model/especialidad.model';
import { Trabajador } from '../../../core/model/trabajador.model';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { TrabajadorService } from '../../../core/services/trabajador.service';
import { TurnoService } from '../../../core/services/turno.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { TurnoResponse } from '../../admision/admision.models';

interface DiaCalendario {
  fecha: string;
  dia: number;
  fueraMes: boolean;
  hoy: boolean;
}

@Component({
  selector: 'app-horarios-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './horarios-medicos.component.html',
  styleUrl: './horarios-medicos.component.scss'
})
export class HorariosMedicosComponent implements OnInit {
  especialidades: Especialidad[] = [];
  medicos: Trabajador[] = [];
  medicosFiltrados: Trabajador[] = [];
  medicosEdicion: Trabajador[] = [];
  turnosEdicion = signal<TurnoResponse[]>([]);
  turnosMaestro = signal<TurnoResponse[]>([]);
  turnoEditando = signal<TurnoResponse | null>(null);
  dias: DiaCalendario[] = [];
  fechasSeleccionadas = signal<string[]>([]);

  especialidadId: number | null = null;
  medicoId: number | null = null;
  mes = new Date().toISOString().slice(0, 7);
  horaInicio = '08:00';
  horaFin = '16:00';

  editEspecialidadId: number | null = null;
  editMedicoId: number | null = null;
  editFecha = '';
  editHoraInicio = '08:00';
  editHoraFin = '16:00';

  arrastrando = false;

  cargandoEdicion = signal(false);
  cargandoMaestro = signal(false);
  mensaje = signal('');
  error = signal('');

  constructor(
    private especialidadService: EspecialidadService,
    private trabajadorService: TrabajadorService,
    private turnoService: TurnoService
  ) { }

  ngOnInit(): void {
    this.especialidadService.listar().subscribe(data => this.especialidades = data);
    this.trabajadorService.getMedicosActivos().subscribe(data => {
      this.medicos = data;
      this.medicosFiltrados = this.filtrarMedicosPorEspecialidad(this.especialidadId);
      this.medicosEdicion = this.filtrarMedicosPorEspecialidad(this.editEspecialidadId);
    });
    this.construirCalendario();
    this.cargarTurnosMaestro();
  }

  cambiarEspecialidad(): void {
    this.medicoId = null;
    this.medicosFiltrados = this.filtrarMedicosPorEspecialidad(this.especialidadId);
    this.cargarTurnosEdicion();
  }

  cargarTurnos(): void {
    this.cargarTurnosEdicion();
    this.cargarTurnosMaestro();
  }

  cargarTurnosEdicion(): void {
    this.construirCalendario();
    if (!this.especialidadId || !this.mes) {
      this.turnosEdicion.set([]);
      return;
    }
    const [anio, mes] = this.mes.split('-').map(Number);
    this.cargandoEdicion.set(true);
    this.turnoService.listar(Number(this.especialidadId), anio, mes).subscribe({
      next: data => {
        this.turnosEdicion.set(data);
        this.cargandoEdicion.set(false);
      },
      error: e => {
        this.error.set(e.error?.mensaje ?? 'No se pudieron cargar los turnos de la especialidad.');
        this.cargandoEdicion.set(false);
      }
    });
  }

  cargarTurnosMaestro(): void {
    if (!this.mes) return;
    this.construirCalendario();
    const [anio, mes] = this.mes.split('-').map(Number);
    this.cargandoMaestro.set(true);
    this.turnoService.listar(null, anio, mes).subscribe({
      next: data => {
        this.turnosMaestro.set(data);
        this.cargandoMaestro.set(false);
      },
      error: e => {
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar el calendario maestro.');
        this.cargandoMaestro.set(false);
      }
    });
  }

  cambiarMes(): void {
    this.fechasSeleccionadas.set([]);
    this.construirCalendario();
    this.cargarTurnos();
  }

  iniciarSeleccion(dia: DiaCalendario, event: MouseEvent): void {
    event.preventDefault();
    if (dia.fueraMes) return;
    this.arrastrando = true;
    this.alternarFecha(dia.fecha);
  }

  arrastrarSeleccion(dia: DiaCalendario): void {
    if (!this.arrastrando || dia.fueraMes) return;
    this.agregarFecha(dia.fecha);
  }

  @HostListener('document:mouseup')
  terminarSeleccion(): void {
    this.arrastrando = false;
  }

  crearTurnosSeleccionados(): void {
    if (!this.especialidadId || !this.medicoId || this.fechasSeleccionadas().length === 0 || !this.horaInicio || !this.horaFin) {
      this.error.set('Seleccione especialidad, medico, al menos un dia y horario.');
      return;
    }
    this.limpiarMensajes();
    this.crearFechas(this.fechasSeleccionadas());
  }

  reemplazarSeleccion(): void {
    const fechas = this.fechasSeleccionadas();
    if (!this.especialidadId || !this.medicoId || fechas.length === 0) {
      this.error.set('Seleccione especialidad, medico y dias para reemplazar.');
      return;
    }
    this.limpiarMensajes();
    const turnosObjetivo = this.turnosEdicion().filter(t =>
      fechas.includes(t.fecha) && t.medicoId === Number(this.medicoId)
    );
    this.eliminarMultiples(turnosObjetivo, () => this.crearFechas(fechas));
  }

  eliminarSeleccion(): void {
    const fechas = this.fechasSeleccionadas();
    if (fechas.length === 0) {
      this.error.set('Seleccione uno o mas dias para eliminar turnos.');
      return;
    }
    this.limpiarMensajes();
    const turnosObjetivo = this.turnosEdicion().filter(t =>
      fechas.includes(t.fecha) && (!this.medicoId || t.medicoId === Number(this.medicoId))
    );
    if (turnosObjetivo.length === 0) {
      this.error.set('No hay turnos visibles para eliminar en la seleccion.');
      return;
    }
    this.eliminarMultiples(turnosObjetivo, () => {
      this.mensaje.set(`Turnos eliminados: ${turnosObjetivo.length}.`);
      this.fechasSeleccionadas.set([]);
      this.cargarTurnos();
    });
  }

  crearLunesAViernes(): void {
    const fechas = this.dias
      .filter(d => !d.fueraMes)
      .filter(d => {
        const day = new Date(`${d.fecha}T00:00:00`).getDay();
        return day >= 1 && day <= 5;
      })
      .map(d => d.fecha);
    this.fechasSeleccionadas.set(fechas);
  }

  seleccionarTodoMes(): void {
    this.fechasSeleccionadas.set(this.dias.filter(d => !d.fueraMes).map(d => d.fecha));
  }

  limpiarSeleccion(): void {
    this.fechasSeleccionadas.set([]);
  }

  turnosDelDia(fecha: string): TurnoResponse[] {
    return this.turnosEdicion().filter(t => t.fecha === fecha);
  }

  turnosMaestroDelDia(fecha: string): TurnoResponse[] {
    return this.turnosMaestro().filter(t => t.fecha === fecha);
  }

  estaSeleccionado(fecha: string): boolean {
    return this.fechasSeleccionadas().includes(fecha);
  }

  editar(turno: TurnoResponse): void {
    const especialidadId = turno.especialidadId ?? this.buscarEspecialidadId(turno.especialidad);
    this.limpiarMensajes();
    this.turnoEditando.set(turno);
    this.editEspecialidadId = especialidadId;
    this.medicosEdicion = this.filtrarMedicosPorEspecialidad(especialidadId);
    this.editMedicoId = turno.medicoId;
    this.editFecha = turno.fecha;
    this.editHoraInicio = this.horaCorta(turno.horaInicio);
    this.editHoraFin = this.horaCorta(turno.horaFin);
  }

  cambiarEspecialidadEdicion(): void {
    this.editMedicoId = null;
    this.medicosEdicion = this.filtrarMedicosPorEspecialidad(this.editEspecialidadId);
  }

  guardarEdicion(): void {
    const turno = this.turnoEditando();
    if (!turno || !this.editEspecialidadId || !this.editMedicoId || !this.editFecha || !this.editHoraInicio || !this.editHoraFin) {
      this.error.set('Complete especialidad, medico, fecha y horario para editar.');
      return;
    }
    this.limpiarMensajes();
    this.turnoService.actualizar(turno.id, {
      especialidadId: Number(this.editEspecialidadId),
      medicoId: Number(this.editMedicoId),
      fecha: this.editFecha,
      horaInicio: this.editHoraInicio,
      horaFin: this.editHoraFin
    }).subscribe({
      next: () => {
        this.mensaje.set('Turno actualizado con las reglas de disponibilidad.');
        this.cancelarEdicion();
        this.cargarTurnos();
      },
      error: e => this.error.set(e.error?.mensaje ?? 'No se pudo actualizar el turno.')
    });
  }

  cancelarEdicion(): void {
    this.turnoEditando.set(null);
  }

  private crearFechas(fechas: string[]): void {
    let pendientes = fechas.length;
    let creados = 0;
    let fallidos = 0;

    fechas.forEach(fecha => {
      this.turnoService.crear({
        especialidadId: Number(this.especialidadId),
        medicoId: Number(this.medicoId),
        fecha,
        horaInicio: this.horaInicio,
        horaFin: this.horaFin
      }).subscribe({
        next: () => { creados++; this.finalizarCargaMasiva(--pendientes, creados, fallidos); },
        error: () => { fallidos++; this.finalizarCargaMasiva(--pendientes, creados, fallidos); }
      });
    });
  }

  eliminar(turno: TurnoResponse): void {
    this.turnoService.eliminar(turno.id).subscribe({
      next: () => {
        if (this.turnoEditando()?.id === turno.id) {
          this.cancelarEdicion();
        }
        this.mensaje.set('Turno eliminado.');
        this.cargarTurnos();
      },
      error: e => this.error.set(e.error?.mensaje ?? 'No se pudo eliminar el turno.')
    });
  }

  etiquetaTurno(t: TurnoResponse): string {
    return `${this.horaCorta(t.horaInicio)}-${this.horaCorta(t.horaFin)} ${t.nombreMedico.split(' ')[0]}`;
  }

  private eliminarMultiples(turnos: TurnoResponse[], alTerminar: () => void): void {
    if (turnos.length === 0) {
      alTerminar();
      return;
    }
    let pendientes = turnos.length;
    turnos.forEach(t => {
      this.turnoService.eliminar(t.id).subscribe({
        next: () => { if (--pendientes === 0) alTerminar(); },
        error: () => { if (--pendientes === 0) alTerminar(); }
      });
    });
  }

  private finalizarCargaMasiva(pendientes: number, creados: number, fallidos: number): void {
    if (pendientes === 0) {
      this.mensaje.set(`Carga masiva terminada. Creados: ${creados}. Omitidos por reglas: ${fallidos}.`);
      this.fechasSeleccionadas.set([]);
      this.cargarTurnos();
    }
  }

  private construirCalendario(): void {
    const [anio, mes] = this.mes.split('-').map(Number);
    const primerDia = new Date(anio, mes - 1, 1);
    const ultimoDia = new Date(anio, mes, 0);
    const inicio = new Date(primerDia);
    const offsetLunes = (primerDia.getDay() + 6) % 7;
    inicio.setDate(primerDia.getDate() - offsetLunes);

    const totalCeldas = Math.ceil((offsetLunes + ultimoDia.getDate()) / 7) * 7;
    const hoy = this.formatearFecha(new Date());

    this.dias = Array.from({ length: totalCeldas }, (_, i) => {
      const fecha = new Date(inicio);
      fecha.setDate(inicio.getDate() + i);
      return {
        fecha: this.formatearFecha(fecha),
        dia: fecha.getDate(),
        fueraMes: fecha.getMonth() !== mes - 1,
        hoy: this.formatearFecha(fecha) === hoy
      };
    });
  }

  private alternarFecha(fecha: string): void {
    if (this.estaSeleccionado(fecha)) {
      this.fechasSeleccionadas.update(fechas => fechas.filter(f => f !== fecha));
    } else {
      this.agregarFecha(fecha);
    }
  }

  private agregarFecha(fecha: string): void {
    if (!this.estaSeleccionado(fecha)) {
      this.fechasSeleccionadas.update(fechas => [...fechas, fecha].sort());
    }
  }

  private filtrarMedicosPorEspecialidad(especialidadId: number | null): Trabajador[] {
    const especialidad = this.especialidades.find(e => e.id === Number(especialidadId));
    if (!especialidad) return [];
    return this.medicos.filter(m =>
      m.especialidades?.some(x => x.toLowerCase() === especialidad.nombre.toLowerCase())
    );
  }

  private buscarEspecialidadId(nombre: string): number | null {
    return this.especialidades.find(e => e.nombre.toLowerCase() === nombre.toLowerCase())?.id ?? null;
  }

  private horaCorta(hora: string): string {
    return hora.slice(0, 5);
  }

  private formatearFecha(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private limpiarMensajes(): void {
    this.mensaje.set('');
    this.error.set('');
  }
}
