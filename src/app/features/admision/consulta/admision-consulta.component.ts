import { EspecialidadService } from '../../../core/services/especialidad.service';
import { Especialidad } from '../../../core/model/especialidad.model';
import { TrabajadorService } from '../../../core/services/trabajador.service';
import { Trabajador } from '../../../core/model/trabajador.model';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../shared/header/header.component';
import { CitaRequest } from '../admision.models';

@Component({
  selector: 'app-admision-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './admision-consulta.component.html',
  styleUrl: '../admision.component.scss'
})
export class AdmisionConsultaComponent implements OnInit {

  // --- VARIABLES DEL STEPPER ---
  pasoActual = signal<number>(1);
  totalPasos = 4;

  // --- MODELO DE DATOS ---
  cita: CitaRequest = { historiaClinicaId: null, especialidadId: null, fechaHora: '' };
  medicoSeleccionado: any = null;
  exitoMensaje = signal('');

  // --- VARIABLES DEL AUTOCOMPLETADO ---
  terminoBusquedaEspecialidad: string = '';
  mostrarDropdownEspecialidad: boolean = false;
  especialidadesDB: Especialidad[] = [];
  especialidadesFiltradas: Especialidad[] = [];
  medicosDisponibles: Trabajador[] = [];
  cargandoMedicos: boolean = false;

  // --- MÉTODOS DE FECHA Y HORA ---
  obtenerFechaMinima(): string {
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    return ahora.toISOString().slice(0, 16);
  }

  constructor(
    private route: ActivatedRoute,
    private especialidadService: EspecialidadService,
    private trabajadorService: TrabajadorService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      if (p['historiaId']) this.cita.historiaClinicaId = +p['historiaId'];
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

    // Regla 1: Si no hay texto, ocultamos y vaciamos todo
    if (!termino) {
      this.especialidadesFiltradas = [];
      this.mostrarDropdownEspecialidad = false;
      this.cita.especialidadId = null;
      return;
    }

    this.mostrarDropdownEspecialidad = true;

    // Regla 2: Filtrar las que COMIENZAN exactamente con la letra/palabra
    this.especialidadesFiltradas = this.especialidadesDB.filter(esp =>
      esp.nombre.toLowerCase().startsWith(termino)
    );

    // Seguridad: Si modifica el texto válido, borramos el ID seleccionado temporalmente
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
        this.terminoBusquedaEspecialidad = ''; // Limpia si hizo clic fuera sin seleccionar
      }
    }, 200);
  }

  // --- MÉTODOS DEL STEPPER ---
  siguientePaso(): void {
    // Si estamos pasando del Paso 1 al Paso 2, cargamos los médicos
    if (this.pasoActual() === 1 && this.cita.especialidadId) {
      this.cargarMedicosPorEspecialidad();
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

        // CORRECCIÓN: Como m.especialidades es un Array (string[]), usamos .some()
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
      historiaClinicaId: this.cita.historiaClinicaId,
      especialidadId: this.cita.especialidadId,
      medicoId: this.medicoSeleccionado?.id,
      fechaHora: this.cita.fechaHora
    };

    console.log('Enviando cita al backend:', payload);

    this.exitoMensaje.set('¡Cita programada correctamente! (Falta conectar a BD)');
  }
}