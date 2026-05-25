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
  cargandoMedicos = false;
  cargandoHorarios = false;
  guardandoCita = false;

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

  mesActual: number = new Date().getMonth();
  anioActual: number = new Date().getFullYear();
  mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  diasCalendario: any[] = [];
  horaSeleccionada: string = '';
  mostrarModalHorarios: boolean = false;
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
          dniPaciente: '',
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
    if (!this.dniBusqueda.trim()) return;
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
        this.exitoMensaje.set(`Historia ${resp.numeroHistoria} creada. Continúe con la programación.`);
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
    this.especialidadesFiltradas = this.especialidadesDB.filter(esp => esp.nombre.toLowerCase().startsWith(termino));

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
        console.error('Error al cargar los médicos', err);
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
    const año = this.anioActual;
    const mes = this.mesActual;
    
    const fechaInicioStr = `${año}-${String(mes + 1).padStart(2, '0')}-01`;
    const ultimoDia = new Date(año, mes + 1, 0).getDate();
    const fechaFinStr = `${año}-${String(mes + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

    const primerDiaMes = new Date(año, mes, 1);
    let diaSemanaInicio = primerDiaMes.getDay();
    diaSemanaInicio = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1;

    for (let i = 0; i < diaSemanaInicio; i++) {
      this.diasCalendario.push({ numero: null, vacio: true });
    }

    this.citaService.consultarDisponibilidadMensual(this.medicoSeleccionado.id, fechaInicioStr, fechaFinStr).subscribe({
      next: (disponibilidadBackend: any[]) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const mapaDisponibilidad = new Map(disponibilidadBackend.map(d => [d.fecha, d.horariosDisponibles]));

        for (let i = 1; i <= ultimoDia; i++) {
          const fechaIteracion = new Date(año, mes, i);
          const esPasado = fechaIteracion < hoy;
          const formatoFechaClave = `${año}-${String(mes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
          const horasLibres = mapaDisponibilidad.get(formatoFechaClave) || [];

          let turnosReales: string[] = [];
          if (!esPasado && horasLibres.length > 0) {
            if (horasLibres.some((h: string) => h < '13:00')) turnosReales.push('Mañana');
            if (horasLibres.some((h: string) => h >= '13:00')) turnosReales.push('Tarde');
          }

          this.diasCalendario.push({
            numero: i,
            vacio: false,
            esPasado: esPasado,
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
    if (dia.vacio || dia.esPasado || !dia.horasDisponibles || dia.horasDisponibles.length === 0) return;
    this.diaSeleccionadoModal = dia;
    this.mostrarModalHorarios = true;
  }

  cerrarModalHorarios(): void {
    this.mostrarModalHorarios = false;
    this.diaSeleccionadoModal = null;
  }

  seleccionarHoraCalendario(hora: string): void {
    this.cita.fechaHora = `${this.diaSeleccionadoModal.fechaCompleta}T${hora}:00`;
    this.horaSeleccionada = hora; 
    this.cerrarModalHorarios();
  }

  programarCita(): void {
    if (!this.cita.historiaClinicaId || !this.cita.especialidadId || !this.medicoSeleccionado || !this.cita.fechaHora) {
      this.errorMensaje.set('Complete todos los datos necesarios.');
      return;
    }

    const payload: any = {
      historiaClinicaId: this.cita.historiaClinicaId,
      especialidadId: this.cita.especialidadId,
      medicoId: this.medicoSeleccionado.id,
      fechaHora: this.cita.fechaHora,
      turnoId: this.bloqueSeleccionado?.turnoId || null,
      consultorioId: this.bloqueSeleccionado?.consultorioId || null
    };

    this.limpiarMensajes();
    this.guardandoCita = true;
    console.log('JSON ENVIADO A JAVA:', JSON.stringify(payload, null, 2));
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