import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AtencionMedicaService, CitaOpcion } from '../../../core/services/atencion-medica.service';
import { MedicamentoService } from '../../../core/services/medicamento.service';
import { AuthService } from '../../../core/services/auth.service'; // Inyectado para obtener el ID del médico
import { AtencionMedicaRequest } from '../../../core/model/atencion-medica.model';
import { HistoriaClinicaResponse } from '../../../core/model/historia-clinica.model';

// Interfaz para recibir las opciones del backend
export interface MedicamentoOpcion {
  id: number;
  nombre: string;
  activo: boolean;
}

// Interfaz adaptada para manejar el ID internamente pero mostrar el nombre en la tabla
export interface ItemReceta {
  medicamentoId: number;
  medicamentoNombre: string;
  dias: number;
  cantidad: number;
  indicaciones: string;
}

export interface RecetaEmitida {
  numeroReceta: string;
  nombreMedico: string;
  nombrePaciente: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  items: ItemReceta[];
}

@Component({
  selector: 'app-registro-resultados',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro-resultados.component.html',
  styleUrl: '../atencion-medica.component.scss'
})
export class RegistroResultadosComponent implements OnInit, OnDestroy {

  private atencionService = inject(AtencionMedicaService);
  private medicamentoService = inject(MedicamentoService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  pacienteActivo: HistoriaClinicaResponse | null = null;
  citasDisponibles: CitaOpcion[] = [];
  cargandoCitas = false;
  numeroCita = '';

  diagnosticoCie10 = '';
  notasEvolucion   = '';
  cargando         = false;
  adjuntarReceta: boolean | null = null;

  // Variables para el Autocomplete
  todosMedicamentos: MedicamentoOpcion[] = [];
  medicamentosFiltrados: MedicamentoOpcion[] = [];
  medicamentoInput = '';
  medicamentoSeleccionado: MedicamentoOpcion | null = null; // Guarda la entidad seleccionada
  mostrarSugerencias = false;
  
  diasInput: number | null = null;
  cantidadInput: number | null = null;
  indicacionesInput = '';
  receta: ItemReceta[] = [];

  recetaEmitida: RecetaEmitida | null = null;

  ngOnInit() {
    this.atencionService.pacienteActivo$
      .pipe(takeUntil(this.destroy$))
      .subscribe(paciente => {
        this.pacienteActivo = paciente;
        this.numeroCita = '';
        this.citasDisponibles = [];
        if (paciente) {
          this.cargarCitasDisponibles(paciente.id);
        }
      });

    // Llamada al nuevo endpoint sin paginación
    this.medicamentoService.obtenerTodosParaReceta().subscribe({
      next: lista => this.todosMedicamentos = lista,
      error: err  => console.error('Error al cargar medicamentos', err)
    });
  }

  cargarCitasDisponibles(historiaId: number) {
    this.cargandoCitas = true;
    this.atencionService.obtenerCitasDisponibles(historiaId).subscribe({
      next: lista => {
        this.citasDisponibles = lista;
        this.cargandoCitas = false;
      },
      error: () => this.cargandoCitas = false
    });
  }

  puedeGuardar(): boolean {
    if (!this.numeroCita) return false;
    if (this.diagnosticoCie10.trim().length < 3) return false;
    if (this.adjuntarReceta === null) return false;
    if (this.adjuntarReceta === true && this.receta.length === 0) return false;
    return true;
  }

  guardarAtencion() {
    if (!this.pacienteActivo || !this.puedeGuardar()) return;
    if (this.diagnosticoCie10.trim().length < 3) { alert('El diagnostico debe tener al menos 3 caracteres.'); return; }

    // SOLUCIÓN AL ERROR 400: Se obtiene el ID del médico autenticado
    const medicoActual = this.authService.obtenerUsuarioActual();
    if (!medicoActual || !medicoActual.id) {
        alert('Error de sesión: No se pudo identificar al médico responsable.');
        return;
    }

    this.cargando = true;
    const request: AtencionMedicaRequest = {
      historiaClinicaId:    this.pacienteActivo.id,
      medicoId:             medicoActual.id, // Campo obligatorio solucionado
      numeroCita:           this.numeroCita,
      diagnosticoPrincipal: this.diagnosticoCie10,
      notasEvolucion:       this.notasEvolucion,
      // Mapeamos el array para enviar solo lo que el backend necesita
      itemsReceta:          this.adjuntarReceta ? this.receta.map(item => ({
                                medicamentoId: item.medicamentoId,
                                cantidad: item.cantidad,
                                dias: item.dias,
                                indicaciones: item.indicaciones
                            })) : undefined
    };

    this.atencionService.registrarAtencion(request).subscribe({
      next: (idGenerado: number) => {
        alert('¡Atención guardada con éxito! ID: ' + idGenerado);
        this.resetFormulario();
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al guardar:', err);
        alert(this.obtenerMensajeError(err, 'Ocurrio un error al guardar la atencion.'));
        this.cargando = false;
      }
    });
  }

  private resetFormulario() {
    this.numeroCita = '';
    this.diagnosticoCie10 = '';
    this.notasEvolucion = '';
    this.adjuntarReceta = null;
    this.receta = [];
    this.limpiarCamposMedicamento();
  }

  limpiarCamposMedicamento() {
    this.medicamentoInput = '';
    this.medicamentoSeleccionado = null;
    this.diasInput = null;
    this.cantidadInput = null;
    this.indicacionesInput = '';
    this.medicamentosFiltrados = [];
  }

  filtrarMedicamentos(termino: string) {
    // Si el usuario edita el texto después de haber seleccionado uno, borramos la selección
    this.medicamentoSeleccionado = null; 
    
    const t = termino.toLowerCase().trim();
    if (!t) { this.medicamentosFiltrados = []; return; }
    
    this.medicamentosFiltrados = this.todosMedicamentos
      .filter(m => m.nombre.toLowerCase().includes(t))
      .slice(0, 10);
  }

  seleccionarMedicamento(med: MedicamentoOpcion) {
    if (!med.activo) {
      alert('No se puede recetar un medicamento inactivo.');
      return;
    }
    this.medicamentoSeleccionado = med;
    this.medicamentoInput = med.nombre;
    this.medicamentosFiltrados = [];
    this.mostrarSugerencias = false;
  }

  ocultarSugerenciasConDelay() {
    setTimeout(() => this.mostrarSugerencias = false, 200);
  }

  soloNumeros(event: KeyboardEvent) {
    const char = event.which ?? event.keyCode;
    if (char < 48 || char > 57) event.preventDefault();
  }

  agregarMedicamento() {
    // Validación estricta: debe haber un ID seleccionado
    if (!this.medicamentoSeleccionado) { 
        alert('Debe seleccionar un medicamento válido de la lista desplegable.'); 
        return; 
    }
    if (!Number.isInteger(Number(this.diasInput)) || !this.diasInput || this.diasInput < 1) { alert('Ingrese dias validos en numeros enteros.'); return; }
    if (!Number.isInteger(Number(this.cantidadInput)) || !this.cantidadInput || this.cantidadInput < 1) { alert('Ingrese cantidad valida en numeros enteros.'); return; }
    
    if (this.receta.some(i => i.medicamentoId === this.medicamentoSeleccionado!.id)) {
      alert('Este medicamento ya se encuentra en la receta.');
      return;
    }
    
    this.receta.push({
      medicamentoId:     this.medicamentoSeleccionado.id,
      medicamentoNombre: this.medicamentoSeleccionado.nombre,
      dias:              this.diasInput,
      cantidad:          this.cantidadInput,
      indicaciones:      this.indicacionesInput.trim()
    });
    
    this.limpiarCamposMedicamento();
  }

  quitarMedicamento(item: ItemReceta) {
    this.receta = this.receta.filter(r => r.medicamentoId !== item.medicamentoId);
  }

  emitirReceta() {
    if (this.adjuntarReceta !== true || this.receta.length === 0) return;
    const ahora = new Date();
    const vencimiento = new Date(ahora);
    vencimiento.setMonth(vencimiento.getMonth() + 1);
    
    const pad = (n: number, l = 2) => String(n).padStart(l, '0');
    const fechaParte = `${ahora.getFullYear()}${pad(ahora.getMonth() + 1)}${pad(ahora.getDate())}`;
    const aleatorio = Math.floor(10000 + Math.random() * 90000);

    const medicoActual = this.authService.obtenerUsuarioActual();

    this.recetaEmitida = {
      numeroReceta: `REC-${fechaParte}-${aleatorio}`,
      nombreMedico: medicoActual?.nombreCompleto || 'Médico Tratante',
      nombrePaciente: this.pacienteActivo?.nombreCompleto ?? 'Paciente',
      fechaEmision: ahora,
      fechaVencimiento: vencimiento,
      items: [...this.receta]
    };
    
    setTimeout(() => { 
      window.print(); 
      this.recetaEmitida = null;
    }, 300);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private obtenerMensajeError(error: any, fallback: string): string {
    return error?.error?.mensaje
      ?? error?.error?.message
      ?? error?.message
      ?? fallback;
  }
}
