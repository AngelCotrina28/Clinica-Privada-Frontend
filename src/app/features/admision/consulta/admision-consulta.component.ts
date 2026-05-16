import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { Especialidad } from '../../../core/model/especialidad.model';
import { CitaService } from '../../../core/services/cita.service';
import { Trabajador } from '../../../core/model/trabajador.model';
import { HeaderComponent } from '../../../shared/header/header.component';
import { AbrirHistoriaRequest, CitaRequest, CitaResponse, HistoriaClinicaResponse, HorarioBloque } from '../admision.models';

@Component({
  selector: 'app-admision-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './admision-consulta.component.html',
  styleUrl: '../admision.component.scss'
})
export class AdmisionConsultaComponent implements OnInit {
  private readonly API = 'http://localhost:8080/api';

  pasoActual = signal<number>(1);
  totalPasos = 4;

  cita: CitaRequest = { historiaClinicaId: null, especialidadId: null, fechaHora: '' };
  medicoSeleccionado: Trabajador | null = null;
  fechaSeleccionada = '';
  bloquesHorarios: HorarioBloque[] = [];
  bloqueSeleccionado: HorarioBloque | null = null;
  citaProgramada = signal<CitaResponse | null>(null);
  exitoMensaje = signal('');
  errorMensaje = signal('');

  dniBusqueda = '';
  mostrarFormNueva = false;
  historiaSeleccionada = signal<HistoriaClinicaResponse | null>(null);
  nuevaHistoria: AbrirHistoriaRequest = this.initHistoria();
  cargandoHistoria = signal(false);

  terminoBusquedaEspecialidad = '';
  mostrarDropdownEspecialidad = false;
  especialidadesDB: Especialidad[] = [];
  especialidadesFiltradas: Especialidad[] = [];
  medicosDisponibles: Trabajador[] = [];
  cargandoMedicos = false;
  cargandoHorarios = false;
  guardandoCita = false;

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
          dniPaciente: '',
          nombreCompleto: p['nombre'] ?? '',
          creadoPor: '',
          createdAt: '',
          nuevaHistoria: false
        });
      }
    });

    this.especialidadService.listar().subscribe({
      next: data => {
        this.especialidadesDB = data;
      },
      error: err => console.error('Error al cargar especialidades de la BD', err)
    });
  }

  obtenerFechaMinima(): string {
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    return ahora.toISOString().slice(0, 10);
  }

  buscarHistoria(): void {
    if (!this.dniBusqueda.trim()) return;
    this.limpiarMensajes();
    this.limpiarHistoriaSeleccionada();
    this.cargandoHistoria.set(true);
    this.http.get<HistoriaClinicaResponse>(
      `${this.API}/admision/historia?dni=${encodeURIComponent(this.dniBusqueda.trim())}`
    ).subscribe({
      next: h => {
        this.seleccionarHistoria(h);
        this.cargandoHistoria.set(false);
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 404) {
          this.mostrarFormNueva = true;
          this.nuevaHistoria.dniPaciente = this.dniBusqueda.trim();
        } else {
          this.errorMensaje.set(e.error?.mensaje ?? 'Error al buscar la historia.');
        }
        this.cargandoHistoria.set(false);
      }
    });
  }

  abrirNuevaHistoria(form: NgForm): void {
    if (form.invalid) return;
    this.limpiarMensajes();
    this.cargandoHistoria.set(true);
    this.nuevaHistoria.desdeAdmision = true;
    this.http.post<HistoriaClinicaResponse>(`${this.API}/admision/historia`, this.nuevaHistoria).subscribe({
      next: resp => {
        this.seleccionarHistoria(resp);
        this.dniBusqueda = resp.dniPaciente;
        this.mostrarFormNueva = false;
        this.nuevaHistoria = this.initHistoria();
        this.exitoMensaje.set(`Historia ${resp.numeroHistoria} creada. Continue con la programacion de la cita.`);
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
    this.limpiarMensajes();
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
    if (!coincidenciaExacta) {
      this.cita.especialidadId = null;
    }
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
      if (!this.cita.especialidadId) {
        this.terminoBusquedaEspecialidad = '';
      }
    }, 200);
  }

  siguientePaso(): void {
    if (this.pasoActual() === 1 && this.cita.especialidadId) {
      this.cargarMedicosPorEspecialidad();
    }

    if (this.pasoActual() < this.totalPasos) {
      this.pasoActual.update(p => p + 1);
    }
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

  cargarDisponibilidad(): void {
    if (!this.medicoSeleccionado || !this.fechaSeleccionada) return;
    this.cargandoHorarios = true;
    this.bloquesHorarios = [];
    this.bloqueSeleccionado = null;
    this.cita.fechaHora = '';
    this.cita.turnoId = null;
    this.cita.consultorioId = null;

    this.citaService.obtenerDisponibilidad(this.medicoSeleccionado.id, this.fechaSeleccionada).subscribe({
      next: bloques => {
        this.bloquesHorarios = bloques;
        this.cargandoHorarios = false;
      },
      error: (e: HttpErrorResponse) => {
        this.errorMensaje.set(e.error?.mensaje ?? 'Error al cargar horarios disponibles.');
        this.cargandoHorarios = false;
      }
    });
  }

  seleccionarBloque(bloque: HorarioBloque): void {
    if (!bloque.disponible || !this.fechaSeleccionada) return;
    this.bloqueSeleccionado = bloque;
    this.cita.fechaHora = `${this.fechaSeleccionada}T${bloque.horaInicio}`;
    this.cita.turnoId = bloque.turnoId;
    this.cita.consultorioId = bloque.consultorioId;
  }

  pasoAnterior(): void {
    if (this.pasoActual() > 1) {
      this.pasoActual.update(p => p - 1);
    }
  }

  programarCita(): void {
    if (!this.cita.historiaClinicaId || !this.cita.especialidadId || !this.medicoSeleccionado || !this.bloqueSeleccionado) {
      this.errorMensaje.set('Complete historia, especialidad, medico y horario.');
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
        this.cargarDisponibilidad();
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
    this.pasoActual.set(1);
  }

  private limpiarSeleccionHorario(): void {
    this.fechaSeleccionada = '';
    this.bloquesHorarios = [];
    this.bloqueSeleccionado = null;
    this.citaProgramada.set(null);
    this.cita.medicoId = null;
    this.cita.fechaHora = '';
    this.cita.turnoId = null;
    this.cita.consultorioId = null;
  }

  private seleccionarHistoria(historia: HistoriaClinicaResponse): void {
    this.historiaSeleccionada.set(historia);
    this.cita.historiaClinicaId = historia.id;
    this.mostrarFormNueva = false;
  }

  private initHistoria(): AbrirHistoriaRequest {
    return { dniPaciente: '', nombreCompleto: '', telefono: '', email: '', fechaNacimiento: '', genero: '', direccion: '', desdeAdmision: true };
  }

  private limpiarMensajes(): void {
    this.errorMensaje.set('');
    this.exitoMensaje.set('');
  }
}
