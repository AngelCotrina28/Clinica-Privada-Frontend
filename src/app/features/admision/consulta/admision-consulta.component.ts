import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Especialidad } from '../../../core/model/especialidad.model';
import { Trabajador } from '../../../core/model/trabajador.model';
import { CitaService } from '../../../core/services/cita.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { AbrirHistoriaRequest, CitaRequest, CitaResponse, HistoriaClinicaResponse, HorarioBloque } from '../admision.models';
import {
  limpiarDocumentoPaciente,
  maxDocumentoPaciente,
  mensajeDocumentoPaciente,
  patronDocumentoPaciente,
  TipoDocumentoPaciente
} from '../documento-paciente.util';

type GrupoTurnoHorario = 'manana' | 'tarde';

interface TurnoHorarioVista {
  id: GrupoTurnoHorario;
  titulo: string;
  rangoFallback: string;
}

@Component({
  selector: 'app-admision-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './admision-consulta.component.html',
  styleUrls: ['../admision.component.scss', './admision-consulta.component.scss']
})
export class AdmisionConsultaComponent implements OnInit {
  private readonly API = 'http://localhost:8080/api';

  pasoActual = signal<number>(1);
  totalPasos = 4;
  readonly turnosHorario: TurnoHorarioVista[] = [
    { id: 'manana', titulo: 'Turno manana', rangoFallback: '08:00 a.m. - 12:00 p.m.' },
    { id: 'tarde', titulo: 'Turno tarde', rangoFallback: '02:00 p.m. - 07:00 p.m.' }
  ];

  cita: CitaRequest = { historiaClinicaId: null, especialidadId: null, fechaHora: '' };
  medicoSeleccionado: Trabajador | null = null;
  fechaSeleccionada = '';
  bloquesHorarios: HorarioBloque[] = [];
  bloqueSeleccionado: HorarioBloque | null = null;
  citaProgramada = signal<CitaResponse | null>(null);

  exitoMensaje = signal('');
  errorMensaje = signal('');
  cargandoMedicos = false;
  cargandoHorarios = false;
  guardandoCita = false;

  dniBusqueda = '';
  tipoDocumentoBusqueda: TipoDocumentoPaciente = 'DNI';
  tipoDocumentoNueva: TipoDocumentoPaciente = 'DNI';
  documentoBusquedaTocado = false;
  documentoNuevaTocado = false;
  mostrarFormNueva = false;
  historiaSeleccionada = signal<HistoriaClinicaResponse | null>(null);
  nuevaHistoria: AbrirHistoriaRequest = this.initHistoria();
  cargandoHistoria = signal(false);

  terminoBusquedaEspecialidad = '';
  mostrarDropdownEspecialidad = false;
  especialidadesDB: Especialidad[] = [];
  especialidadesFiltradas: Especialidad[] = [];
  medicosDisponibles: Trabajador[] = [];

  mesActual = new Date().getMonth();
  anioActual = new Date().getFullYear();
  mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  diasCalendario: any[] = [];
  horaSeleccionada = '';
  mostrarModalHorarios = false;
  diaSeleccionadoModal: any = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private especialidadService: EspecialidadService,
    private citaService: CitaService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      if (p['historiaId']) {
        this.seleccionarHistoria({
          id: +p['historiaId'],
          numeroHistoria: p['numeroHistoria'] ?? '',
          dniPaciente: p['dni'] ?? '',
          nombreCompleto: p['nombre'] ?? '',
          creadoPor: '',
          createdAt: '',
          nuevaHistoria: false
        });
      }
    });

    this.especialidadService.listar().subscribe({
      next: data => this.especialidadesDB = data,
      error: err => console.error('Error al cargar especialidades de la BD', err)
    });
  }

  siguientePaso(): void {
    if (this.pasoActual() === 1 && this.cita.especialidadId) {
      this.cargarMedicosPorEspecialidad();
    }

    if (this.pasoActual() === 2 && this.medicoSeleccionado) {
      this.generarCalendario();
    }

    if (this.pasoActual() === 3 && !this.cita.fechaHora) {
      this.errorMensaje.set('Seleccione un horario disponible para continuar.');
      return;
    }

    if (this.pasoActual() < this.totalPasos) {
      this.pasoActual.update(p => p + 1);
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual() > 1) {
      this.pasoActual.update(p => p - 1);
    }
  }

  buscarHistoria(): void {
    this.documentoBusquedaTocado = true;
    this.dniBusqueda = limpiarDocumentoPaciente(this.tipoDocumentoBusqueda, this.dniBusqueda);
    const errorDocumento = this.documentoBusquedaError();
    if (errorDocumento) {
      this.errorMensaje.set(errorDocumento);
      return;
    }

    this.limpiarMensajes();
    this.limpiarHistoriaSeleccionada();
    this.cargandoHistoria.set(true);

    this.http.get<HistoriaClinicaResponse>(`${this.API}/admision/historia?dni=${encodeURIComponent(this.dniBusqueda.trim())}`).subscribe({
      next: h => {
        this.seleccionarHistoria(h);
        this.cargandoHistoria.set(false);
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 404) {
          this.tipoDocumentoNueva = this.tipoDocumentoBusqueda;
          this.mostrarFormNueva = true;
          this.documentoNuevaTocado = false;
          this.nuevaHistoria = { ...this.initHistoria(), dniPaciente: this.dniBusqueda.trim() };
        } else {
          this.errorMensaje.set(e.error?.mensaje ?? 'Error al buscar la historia.');
        }
        this.cargandoHistoria.set(false);
      }
    });
  }

  abrirNuevaHistoria(form: NgForm): void {
    this.documentoNuevaTocado = true;
    this.nuevaHistoria.dniPaciente = limpiarDocumentoPaciente(this.tipoDocumentoNueva, this.nuevaHistoria.dniPaciente);
    const errorDocumento = this.documentoNuevaError();
    if (form.invalid || errorDocumento) {
      if (errorDocumento) this.errorMensaje.set(errorDocumento);
      return;
    }

    this.limpiarMensajes();
    this.cargandoHistoria.set(true);
    this.nuevaHistoria.desdeAdmision = true;

    this.http.post<HistoriaClinicaResponse>(`${this.API}/admision/historia`, this.nuevaHistoria).subscribe({
      next: resp => {
        this.seleccionarHistoria(resp);
        this.dniBusqueda = resp.dniPaciente;
        this.mostrarFormNueva = false;
        this.nuevaHistoria = this.initHistoria();
        this.documentoNuevaTocado = false;
        this.exitoMensaje.set(`Historia ${resp.numeroHistoria} creada. Continue con la programacion.`);
        this.cargandoHistoria.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.errorMensaje.set(e.error?.mensaje ?? 'Error al crear la historia.');
        this.cargandoHistoria.set(false);
      }
    });
  }

  cancelarNueva(): void {
    this.mostrarFormNueva = false;
    this.nuevaHistoria = this.initHistoria();
    this.documentoNuevaTocado = false;
    this.limpiarMensajes();
  }

  prepararNuevaHistoria(): void {
    this.limpiarMensajes();

    if (this.dniBusqueda.trim()) {
      this.documentoBusquedaTocado = true;
      this.dniBusqueda = limpiarDocumentoPaciente(this.tipoDocumentoBusqueda, this.dniBusqueda);
      const errorDocumento = this.documentoBusquedaError();
      if (errorDocumento) {
        this.errorMensaje.set(errorDocumento);
        return;
      }
    }

    this.tipoDocumentoNueva = this.tipoDocumentoBusqueda;
    this.nuevaHistoria = { ...this.initHistoria(), dniPaciente: this.dniBusqueda.trim() };
    this.documentoNuevaTocado = false;
    this.mostrarFormNueva = true;
    this.limpiarHistoriaSeleccionada();
  }

  actualizarDocumentoBusqueda(valor: string): void {
    this.dniBusqueda = limpiarDocumentoPaciente(this.tipoDocumentoBusqueda, valor);
  }

  cambiarTipoDocumentoBusqueda(tipo: TipoDocumentoPaciente): void {
    this.tipoDocumentoBusqueda = tipo;
    this.dniBusqueda = limpiarDocumentoPaciente(tipo, this.dniBusqueda);
    this.documentoBusquedaTocado = !!this.dniBusqueda;
  }

  actualizarDocumentoNueva(valor: string): void {
    this.nuevaHistoria.dniPaciente = limpiarDocumentoPaciente(this.tipoDocumentoNueva, valor);
  }

  cambiarTipoDocumentoNueva(tipo: TipoDocumentoPaciente): void {
    this.tipoDocumentoNueva = tipo;
    this.nuevaHistoria.dniPaciente = limpiarDocumentoPaciente(tipo, this.nuevaHistoria.dniPaciente);
    this.documentoNuevaTocado = !!this.nuevaHistoria.dniPaciente;
  }

  documentoBusquedaError(): string {
    return mensajeDocumentoPaciente(this.tipoDocumentoBusqueda, this.dniBusqueda);
  }

  documentoNuevaError(): string {
    return mensajeDocumentoPaciente(this.tipoDocumentoNueva, this.nuevaHistoria.dniPaciente);
  }

  documentoBusquedaValido(): boolean {
    return !this.documentoBusquedaError();
  }

  puedeAbrirFormularioHistoria(): boolean {
    return !this.cargandoHistoria() && (!this.dniBusqueda.trim() || this.documentoBusquedaValido());
  }

  maxDocumento(tipo: TipoDocumentoPaciente): number {
    return maxDocumentoPaciente(tipo);
  }

  patronDocumento(tipo: TipoDocumentoPaciente): string {
    return patronDocumentoPaciente(tipo);
  }

  filtrarEspecialidades(): void {
    const termino = this.terminoBusquedaEspecialidad.toLowerCase().trim();
    if (!termino) {
      this.especialidadesFiltradas = [];
      this.mostrarDropdownEspecialidad = false;
      this.cita.especialidadId = null;
      return;
    }

    this.mostrarDropdownEspecialidad = true;
    this.especialidadesFiltradas = this.especialidadesDB.filter(esp =>
      esp.nombre.toLowerCase().startsWith(termino)
    );

    const coincidenciaExacta = this.especialidadesDB.find(e => e.nombre.toLowerCase() === termino);
    if (!coincidenciaExacta) this.cita.especialidadId = null;
  }

  seleccionarEspecialidad(esp: Especialidad): void {
    this.cita.especialidadId = esp.id;
    this.terminoBusquedaEspecialidad = esp.nombre;
    this.mostrarDropdownEspecialidad = false;
    this.medicosDisponibles = [];
    this.medicoSeleccionado = null;
    this.limpiarSeleccionHorario();
  }

  cerrarDropdown(): void {
    setTimeout(() => {
      this.mostrarDropdownEspecialidad = false;
      if (!this.cita.especialidadId) this.terminoBusquedaEspecialidad = '';
    }, 200);
  }

  cargarMedicosPorEspecialidad(): void {
    if (!this.cita.especialidadId) return;
    this.cargandoMedicos = true;
    this.medicosDisponibles = [];
    this.medicoSeleccionado = null;
    this.limpiarSeleccionHorario();

    this.citaService.listarMedicosPorEspecialidad(this.cita.especialidadId).subscribe({
      next: medicos => {
        this.medicosDisponibles = medicos;
        this.cargandoMedicos = false;
      },
      error: err => {
        console.error('Error al cargar los medicos', err);
        this.cargandoMedicos = false;
      }
    });
  }

  seleccionarMedico(medico: Trabajador): void {
    this.medicoSeleccionado = medico;
    this.limpiarSeleccionHorario();
    this.cita.medicoId = medico.id;
  }

  cambiarMes(incremento: number): void {
    this.mesActual += incremento;
    if (this.mesActual > 11) {
      this.mesActual = 0;
      this.anioActual++;
    } else if (this.mesActual < 0) {
      this.mesActual = 11;
      this.anioActual--;
    }
    this.generarCalendario();
  }

  generarCalendario(): void {
    if (!this.medicoSeleccionado) return;
    this.diasCalendario = [];
    const anio = this.anioActual;
    const mes = this.mesActual;

    const fechaInicioStr = `${anio}-${String(mes + 1).padStart(2, '0')}-01`;
    const ultimoDia = new Date(anio, mes + 1, 0).getDate();
    const fechaFinStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

    const primerDiaMes = new Date(anio, mes, 1);
    let diaSemanaInicio = primerDiaMes.getDay();
    diaSemanaInicio = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1;

    for (let i = 0; i < diaSemanaInicio; i++) {
      this.diasCalendario.push({ numero: null, vacio: true });
    }

    this.citaService.consultarDisponibilidadMensual(this.medicoSeleccionado.id, fechaInicioStr, fechaFinStr).subscribe({
      next: (disponibilidadBackend: any[]) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const mapaDisponibilidad = new Map(
          disponibilidadBackend.map(d => [d.fecha, d.horariosDisponibles ?? []])
        );

        for (let i = 1; i <= ultimoDia; i++) {
          const fechaIteracion = new Date(anio, mes, i);
          const esPasado = fechaIteracion < hoy;
          const formatoFechaClave = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
          const horasLibres = (mapaDisponibilidad.get(formatoFechaClave) as string[]) || [];

          const turnosReales: string[] = [];
          if (!esPasado && horasLibres.length > 0) {
            if (horasLibres.some((h: string) => this.normalizarHora(h) < '13:00')) turnosReales.push('Manana');
            if (horasLibres.some((h: string) => this.normalizarHora(h) >= '13:00')) turnosReales.push('Tarde');
          }

          this.diasCalendario.push({
            numero: i,
            vacio: false,
            esPasado,
            turnos: turnosReales,
            fechaCompleta: formatoFechaClave,
            horasDisponibles: horasLibres
          });
        }
      },
      error: err => console.error('Error cargando calendario mensual:', err)
    });
  }

  abrirModalHorarios(dia: any): void {
    if (dia.vacio || dia.esPasado || !dia.horasDisponibles || dia.horasDisponibles.length === 0 || !this.medicoSeleccionado) return;

    this.diaSeleccionadoModal = dia;
    this.mostrarModalHorarios = true;
    this.cargandoHorarios = true;
    this.bloquesHorarios = [];

    this.citaService.obtenerDisponibilidad(this.medicoSeleccionado.id, dia.fechaCompleta).subscribe({
      next: bloques => {
        this.bloquesHorarios = bloques;
        this.cargandoHorarios = false;
      },
      error: err => {
        console.error('Error cargando horarios del dia:', err);
        this.errorMensaje.set('No se pudieron cargar los horarios del dia seleccionado.');
        this.cargandoHorarios = false;
      }
    });
  }

  cerrarModalHorarios(): void {
    this.mostrarModalHorarios = false;
    this.diaSeleccionadoModal = null;
  }

  seleccionarBloqueHorario(bloque: HorarioBloque): void {
    if (!bloque.disponible || !this.diaSeleccionadoModal) return;

    const hora = this.normalizarHora(bloque.horaInicio);
    this.bloqueSeleccionado = bloque;
    this.cita.fechaHora = `${this.diaSeleccionadoModal.fechaCompleta}T${hora}:00`;
    this.horaSeleccionada = hora;
    this.limpiarMensajes();
  }

  bloquesPorTurno(turno: GrupoTurnoHorario): HorarioBloque[] {
    return this.bloquesHorarios
      .filter(bloque => {
        const hora = this.normalizarHora(bloque.horaInicio);
        return turno === 'manana' ? hora < '13:00' : hora >= '13:00';
      })
      .sort((a, b) => this.normalizarHora(a.horaInicio).localeCompare(this.normalizarHora(b.horaInicio)));
  }

  rangoTurno(turno: TurnoHorarioVista): string {
    const bloques = this.bloquesPorTurno(turno.id);
    if (bloques.length === 0) return turno.rangoFallback;

    return `${this.formatearHora(bloques[0].horaInicio)} - ${this.formatearHora(bloques[bloques.length - 1].horaFin)}`;
  }

  esBloqueSeleccionado(bloque: HorarioBloque): boolean {
    if (!this.bloqueSeleccionado || !this.cita.fechaHora || !this.diaSeleccionadoModal) return false;

    return this.bloqueSeleccionado.turnoId === bloque.turnoId
      && this.normalizarHora(this.bloqueSeleccionado.horaInicio) === this.normalizarHora(bloque.horaInicio)
      && this.cita.fechaHora.startsWith(this.diaSeleccionadoModal.fechaCompleta);
  }

  horarioSeleccionadoTexto(): string {
    if (!this.cita.fechaHora) return '';

    const [fecha, hora] = this.cita.fechaHora.split('T');
    return `${this.formatearFecha(fecha)} - ${this.formatearHora(hora)}`;
  }

  formatearHora(hora: string | undefined | null): string {
    const limpia = this.normalizarHora(hora ?? '');
    if (!limpia) return '-';

    const [hh, mm] = limpia.split(':').map(Number);
    const periodo = hh >= 12 ? 'p.m.' : 'a.m.';
    const hora12 = hh % 12 || 12;
    return `${String(hora12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${periodo}`;
  }

  formatearFecha(fecha: string | undefined | null): string {
    if (!fecha) return '-';

    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  programarCita(): void {
    if (!this.cita.historiaClinicaId || !this.cita.especialidadId || !this.medicoSeleccionado || !this.cita.fechaHora || !this.bloqueSeleccionado) {
      this.errorMensaje.set('Complete todos los datos necesarios y seleccione un horario disponible.');
      return;
    }

    const payload: CitaRequest = {
      historiaClinicaId: this.cita.historiaClinicaId,
      especialidadId: this.cita.especialidadId,
      medicoId: this.medicoSeleccionado.id,
      fechaHora: this.cita.fechaHora,
      turnoId: this.bloqueSeleccionado.turnoId,
      consultorioId: this.bloqueSeleccionado.consultorioId
    };

    this.limpiarMensajes();
    this.guardandoCita = true;
    this.citaService.programar(payload).subscribe({
      next: cita => {
        this.citaProgramada.set(cita);
        this.exitoMensaje.set(`Cita ${cita.numeroCita} programada correctamente.`);
        this.guardandoCita = false;
        this.pasoActual.set(4);
      },
      error: (e: HttpErrorResponse) => {
        this.errorMensaje.set(e.error?.mensaje ?? 'Error al programar la cita.');
        this.guardandoCita = false;
      }
    });
  }

  limpiarHistoriaSeleccionada(): void {
    this.historiaSeleccionada.set(null);
    this.cita.historiaClinicaId = null;
    this.citaProgramada.set(null);
    this.pasoActual.set(1);
  }

  private limpiarSeleccionHorario(): void {
    this.fechaSeleccionada = '';
    this.bloquesHorarios = [];
    this.bloqueSeleccionado = null;
    this.citaProgramada.set(null);
    this.cita.medicoId = null;
    this.cita.fechaHora = '';
    this.horaSeleccionada = '';
    this.mostrarModalHorarios = false;
    this.diaSeleccionadoModal = null;
    this.cargandoHorarios = false;
  }

  private seleccionarHistoria(historia: HistoriaClinicaResponse): void {
    this.historiaSeleccionada.set(historia);
    this.cita.historiaClinicaId = historia.id;
    this.mostrarFormNueva = false;
    this.documentoNuevaTocado = false;
  }

  private initHistoria(): AbrirHistoriaRequest {
    return {
      dniPaciente: '',
      nombreCompleto: '',
      telefono: '',
      email: '',
      fechaNacimiento: '',
      genero: '',
      direccion: '',
      desdeAdmision: true
    };
  }

  private limpiarMensajes(): void {
    this.errorMensaje.set('');
    this.exitoMensaje.set('');
  }

  private normalizarHora(hora: string): string {
    return (hora ?? '').slice(0, 5);
  }
}
