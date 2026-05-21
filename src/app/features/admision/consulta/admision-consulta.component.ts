import { EspecialidadService } from '../../../core/services/especialidad.service';
import { Especialidad } from '../../../core/model/especialidad.model';
import { TrabajadorService } from '../../../core/services/trabajador.service';
import { Trabajador } from '../../../core/model/trabajador.model';
import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../shared/header/header.component';
import { CitaRequest } from '../admision.models';
import { HistoriaClinicaService } from '../../../core/services/historia-clinica.service';
import { CitaService } from '../../../core/services/cita.service';

@Component({
  selector: 'app-admision-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './admision-consulta.component.html',
  styleUrl: '../admision.component.scss'
})
export class AdmisionConsultaComponent implements OnInit {

  private historiaClinicaService = inject(HistoriaClinicaService);

  // --- VARIABLES DEL STEPPER ---
  pasoActual = signal<number>(1);
  totalPasos = 5;

  // --- MODELO DE DATOS ---
  cita: CitaRequest = { pacienteId: null, especialidadId: null, fechaHora: '' };
  medicoSeleccionado: any = null;
  exitoMensaje = signal('');

  // --- VARIABLES DEL AUTOCOMPLETADO ---
  terminoBusquedaEspecialidad: string = '';
  mostrarDropdownEspecialidad: boolean = false;
  especialidadesDB: Especialidad[] = [];
  especialidadesFiltradas: Especialidad[] = [];
  medicosDisponibles: Trabajador[] = [];
  cargandoMedicos: boolean = false;

  // ── VARIABLES DE (PACIENTE) ──
  terminoBusquedaPaciente: string = '';
  pacienteSeleccionado: any = null;
  buscandoPaciente: boolean = false;
  errorPaciente: string = '';



  
  private citaService = inject(CitaService);

  // ── VARIABLES DEL CALENDARIO ──
  mesActual: number = new Date().getMonth(); // 
  anioActual: number = new Date().getFullYear();
  mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  diasCalendario: any[] = [];

  fechaSeleccionada: string = '';
  horariosDisponibles: string[] = [];
  cargandoHorarios: boolean = false;
  horaSeleccionada: string = '';

  // ── VARIABLES DEL MODAL ──
  mostrarModalHorarios: boolean = false;
  diaSeleccionadoModal: any = null;

  // --- MÉTODOS DE FECHA Y HORA ---
  obtenerFechaMinima(): string {
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    return ahora.toISOString().slice(0, 16);
  }

  obtenerFechaMinimaSoloDia(): string {
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    return ahora.toISOString().split('T')[0]; // Devuelve solo "YYYY-MM-DD"
  }

  buscarDisponibilidad(): void {
    if (!this.fechaSeleccionada || !this.medicoSeleccionado) return;

    this.cargandoHorarios = true;
    this.horariosDisponibles = [];
    this.horaSeleccionada = '';
    this.cita.fechaHora = ''; // Reseteamos la cita si cambia de día

    // Solicitamos la disponibilidad de 1 solo día (inicio = fin)
    this.citaService.obtenerDisponibilidad(
      this.medicoSeleccionado.id,
      this.fechaSeleccionada,
      this.fechaSeleccionada
    ).subscribe({
      next: (resp: any[]) => {
        // Tu DTO devuelve una lista, tomamos el primer índice (el día consultado)
        if (resp && resp.length > 0 && resp[0].horariosDisponibles) {
          this.horariosDisponibles = resp[0].horariosDisponibles;
        }
        this.cargandoHorarios = false;
      },
      error: (err: any) => {
        console.error('Error al cargar horarios:', err);
        this.cargandoHorarios = false;
      }
    });
  }

  seleccionarHora(hora: string): void {
    this.horaSeleccionada = hora;
    // Formato exacto que exige LocalDateTime en Java (YYYY-MM-DDTHH:mm:00)
    this.cita.fechaHora = `${this.fechaSeleccionada}T${hora}:00`;
  }

  constructor(
    private route: ActivatedRoute,
    private especialidadService: EspecialidadService,
    private trabajadorService: TrabajadorService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      if (p['pacienteId']) this.cita.pacienteId = +p['pacienteId'];
    });

    // Cargar especialidades desde la Base de Datos real al iniciar
    this.especialidadService.listar().subscribe({
      next: (data) => {
        this.especialidadesDB = data;
        // NO llenamos especialidadesFiltradas para que el dropdown inicie vacío
      },
      error: (err) => console.error('Error al cargar especialidades de la BD', err)
    });
  }

  // --- MÉTODOS DEL AUTOCOMPLETADO ---
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
  }

  cerrarDropdown(): void {
    setTimeout(() => {
      this.mostrarDropdownEspecialidad = false;
      if (!this.cita.especialidadId) {
        this.terminoBusquedaEspecialidad = '';
      }
    }, 200);
  }

  // ── BUSCADOR PACIENTE ──
  buscarPaciente(): void {
    const termino = this.terminoBusquedaPaciente.trim();
    if (!termino) return;

    this.buscandoPaciente = true;
    this.errorPaciente = '';
    this.pacienteSeleccionado = null;

    const esDni = /^[0-9]{8}$/.test(termino);
    
    const peticion$ = esDni 
      ? this.historiaClinicaService.buscarPorDni(termino)
      : this.historiaClinicaService.buscarPorNumeroHistoria(termino);

    peticion$.subscribe({
      next: (paciente: any) => {
        this.pacienteSeleccionado = paciente;
        
        this.cita.pacienteId = paciente.id; 
        
        this.buscandoPaciente = false;
      },
      error: (err: any) => {
        console.error(err);
        this.errorPaciente = esDni 
          ? 'No se encontró paciente con este DNI.' 
          : 'No se encontró paciente con este Número de Historia.';
        this.buscandoPaciente = false;
        this.cita.pacienteId = null;
      }
    });
  }

  // ── Generador de la logica del calendario ──
  siguientePaso(): void {
    if (this.pasoActual() === 2 && this.cita.especialidadId) {
      this.cargarMedicosPorEspecialidad();
    }

    if (this.pasoActual() === 3 && this.medicoSeleccionado) {
      this.generarCalendario();
    }

    if (this.pasoActual() < this.totalPasos) {
      this.pasoActual.update(p => p + 1);
    }
  }

  cargarMedicosPorEspecialidad(): void {
    this.cargandoMedicos = true;
    this.medicosDisponibles = [];
    this.medicoSeleccionado = null;

    this.trabajadorService.getMedicosActivos().subscribe({
      next: (medicos) => {
        const especialidadElegida = this.terminoBusquedaEspecialidad.toLowerCase();

        this.medicosDisponibles = medicos.filter(m =>
          m.especialidades &&
          m.especialidades.some(esp => esp.toLowerCase().includes(especialidadElegida))
        );

        this.cargandoMedicos = false;
      },
      error: (err) => {
        console.error('Error al cargar los médicos', err);
        this.cargandoMedicos = false;
      }
    });
  }

  pasoAnterior(): void {
    if (this.pasoActual() > 1) {
      this.pasoActual.update(p => p - 1);
    }
  }

  programarCita(): void {
    const payload = {
      pacienteId: this.cita.pacienteId,
      especialidadId: this.cita.especialidadId,
      medicoId: this.medicoSeleccionado?.id,
      fechaHora: this.cita.fechaHora,
      
      consultorioId: 1, 
      tipoCitaId: 1,
      creadoPorId: 1,
      motivoConsulta: "Reserva generada desde el módulo de Admisión"
    };

    console.log("Enviando cita corregida al backend: ", payload);

    this.citaService.crear(payload).subscribe({
      next: (response) => {
        console.log("Cita guardada con éxito en BD:", response);
        this.pasoActual.set(5); 
        this.exitoMensaje.set('¡Cita programada con éxito!');
      },
      error: (err) => {
        console.error("Error fatal al guardar la cita:", err);
        alert("Ocurrió un error al guardar la cita. Revisa la consola.");
      }
    });
  }

  // ── LÓGICA DEL CALENDARIO MENSUAL ──
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
    this.diasCalendario = [];
    
    // 1. Calcular el rango completo del mes para la consulta al backend
    const año = this.anioActual;
    const mes = this.mesActual;
    
    // Primer día del mes: YYYY-MM-01
    const fechaInicioStr = `${año}-${String(mes + 1).padStart(2, '0')}-01`;
    // Último día del mes
    const ultimoDia = new Date(año, mes + 1, 0).getDate();
    const fechaFinStr = `${año}-${String(mes + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

    const primerDiaMes = new Date(año, mes, 1);
    let diaSemanaInicio = primerDiaMes.getDay();
    diaSemanaInicio = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1; // Ajuste a Lunes inicio

    // 2. Rellenar espacios vacíos del inicio (Offset)
    for (let i = 0; i < diaSemanaInicio; i++) {
      this.diasCalendario.push({ numero: null, vacio: true });
    }

    // 3. Consumir la disponibilidad real desde el Backend
    this.citaService.obtenerDisponibilidad(this.medicoSeleccionado.id, fechaInicioStr, fechaFinStr).subscribe({
      next: (disponibilidadBackend: any[]) => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // Creamos un mapa rápido indexado por fecha para agilizar la búsqueda
        const mapaDisponibilidad = new Map(disponibilidadBackend.map(d => [d.fecha, d.horariosDisponibles]));

        for (let i = 1; i <= ultimoDia; i++) {
          const fechaIteracion = new Date(año, mes, i);
          const esPasado = fechaIteracion < hoy;
          
          // Formatear clave exacta YYYY-MM-DD para buscar en el mapa
          const formatoFechaClave = `${año}-${String(mes + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
          const horasLibres = mapaDisponibilidad.get(formatoFechaClave) || [];

          // Clasificación inteligente del turno según los rangos horarios reales de las horas libres
          let turnosReales: string[] = [];
          if (!esPasado && horasLibres.length > 0) {
            const tieneManana = horasLibres.some((h: string) => h < '13:00');
            const tieneTarde = horasLibres.some((h: string) => h >= '13:00');
            
            if (tieneManana) turnosReales.push('Mañana');
            if (tieneTarde) turnosReales.push('Tarde');
          }

          this.diasCalendario.push({
            numero: i,
            vacio: false,
            esPasado: esPasado,
            turnos: turnosReales, // Datos de disponibilidad real e inmediata
            fechaCompleta: formatoFechaClave,
            horasDisponibles: horasLibres // Guardamos la lista de horas para usarla en el modal
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar la disponibilidad real desde el servidor:', err);
      }
    });
  }

  // ── LÓGICA DEL MODAL DE HORARIOS ──
  abrirModalHorarios(dia: any): void {
    // Solo abrimos el modal si el día es clickeable y tiene horarios
    if (dia.vacio || dia.esPasado || !dia.horasDisponibles || dia.horasDisponibles.length === 0) {
      return;
    }
    
    this.diaSeleccionadoModal = dia;
    this.mostrarModalHorarios = true;
  }

  cerrarModalHorarios(): void {
    this.mostrarModalHorarios = false;
    this.diaSeleccionadoModal = null;
  }

  seleccionarHoraCalendario(hora: string): void {
    // fecha final en formato ISO para Spring Boot (YYYY-MM-DDTHH:mm:00)
    this.cita.fechaHora = `${this.diaSeleccionadoModal.fechaCompleta}T${hora}:00`;
    
    //guardamos solo la hora para mostrarla en el resumen final
    this.horaSeleccionada = hora; 
    
    this.cerrarModalHorarios();
  }
}