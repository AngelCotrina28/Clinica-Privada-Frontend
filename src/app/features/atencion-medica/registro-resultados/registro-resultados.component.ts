import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AtencionMedicaService, CitaOpcion } from '../../../core/services/atencion-medica.service';
import { MedicamentoService, MedicamentoOpcion } from '../../../core/services/medicamento.service';
import { AtencionMedicaRequest, ItemReceta } from '../../../core/model/atencion-medica.model';
import { HistoriaClinicaResponse } from '../../../core/model/historia-clinica.model';

// Interfaz para la emisión de la receta (para la plantilla de impresión)
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
  templateUrl: './registro-resultados.component.html'
})
export class RegistroResultadosComponent implements OnInit, OnDestroy {

  private atencionService   = inject(AtencionMedicaService);
  private medicamentoService = inject(MedicamentoService);
  private destroy$ = new Subject<void>();

  pacienteActivo: HistoriaClinicaResponse | null = null;

  // ── Dropdown de citas ─────────────────────────────────
  citasDisponibles: CitaOpcion[] = [];
  cargandoCitas = false;
  numeroCita = '';

  // ── Campos generales ──────────────────────────────────
  diagnosticoCie10 = '';
  notasEvolucion   = '';
  cargando         = false;
  adjuntarReceta: boolean | null = null;

  // ── Receta embebida ───────────────────────────────────
  todosMedicamentos: MedicamentoOpcion[] = [];
  medicamentosFiltrados: MedicamentoOpcion[] = [];
  medicamentoInput  = '';
  mostrarSugerencias = false;
  diasInput:       number | null = null;
  cantidadInput:   number | null = null;
  indicacionesInput = '';
  receta: ItemReceta[] = [];

  // ── Datos de la receta ya emitida (para imprimir) ─────
  recetaEmitida: RecetaEmitida | null = null;

  ngOnInit() {
    // Escuchar cambios de paciente activo
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

    // Cargar medicamentos para el autocomplete
    this.medicamentoService.obtenerTodosParaReceta().subscribe({
      next: lista => this.todosMedicamentos = lista,
      error: err  => console.error('Error al cargar medicamentos', err)
    });
  }

  // ── Carga citas CONFIRMADAS y órdenes PENDIENTES ──────
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

  // ── Validación del formulario ─────────────────────────
  puedeGuardar(): boolean {
    if (!this.numeroCita) return false;
    if (this.adjuntarReceta === null) return false;
    if (this.adjuntarReceta === true && this.receta.length === 0) return false;
    return true;
  }

  // ── Guardar atención ──────────────────────────────────
  guardarAtencion() {
    if (!this.pacienteActivo || !this.puedeGuardar()) return;
    if (!this.diagnosticoCie10.trim()) { alert('El diagnóstico es obligatorio'); return; }

    this.cargando = true;
    const request: AtencionMedicaRequest = {
      historiaClinicaId:    this.pacienteActivo.id,
      numeroCita:           this.numeroCita,
      diagnosticoPrincipal: this.diagnosticoCie10,
      notasEvolucion:       this.notasEvolucion,
      itemsReceta:          this.adjuntarReceta ? this.receta : undefined
    };

    this.atencionService.registrarAtencion(request).subscribe({
      next: (idGenerado: number) => {
        alert('¡Atención guardada con éxito! ID: ' + idGenerado);
        this.resetFormulario();
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al guardar:', err);
        alert('Ocurrió un error al guardar la atención.');
        this.cargando = false;
      }
    });
  }

  private resetFormulario() {
    this.numeroCita      = '';
    this.diagnosticoCie10 = '';
    this.notasEvolucion  = '';
    this.adjuntarReceta  = null;
    this.receta          = [];
    this.medicamentoInput = '';
    this.diasInput        = null;
    this.cantidadInput    = null;
    this.indicacionesInput = '';
  }

  // ── Autocomplete medicamentos ─────────────────────────
  filtrarMedicamentos(termino: string) {
    const t = termino.toLowerCase().trim();
    if (!t) { this.medicamentosFiltrados = []; return; }
    this.medicamentosFiltrados = this.todosMedicamentos
      .filter(m => m.nombre.toLowerCase().includes(t))
      .slice(0, 10);
  }

  seleccionarMedicamento(med: MedicamentoOpcion) {
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
    const nombre = this.medicamentoInput.trim();
    if (!nombre) { alert('Seleccione o escriba un medicamento.'); return; }
    if (!this.diasInput || this.diasInput < 1) { alert('Ingrese días válido.'); return; }
    if (!this.cantidadInput || this.cantidadInput < 1) { alert('Ingrese cantidad válida.'); return; }
    
    if (this.receta.some(i => i.medicamento.toLowerCase() === nombre.toLowerCase())) {
      alert('Este medicamento ya fue añadido.'); return;
    }
    
    this.receta.push({
      medicamento:  nombre,
      dias:         this.diasInput,
      cantidad:     this.cantidadInput,
      indicaciones: this.indicacionesInput.trim()
    });
    
    this.medicamentoInput  = '';
    this.diasInput         = null;
    this.cantidadInput     = null;
    this.indicacionesInput = '';
    this.medicamentosFiltrados = [];
  }

  quitarMedicamento(item: ItemReceta) {
    this.receta = this.receta.filter(r => r !== item);
  }

  // ── Emitir receta e imprimir ──────────────────────────
  emitirReceta() {
    if (this.receta.length === 0) return;

    const ahora = new Date();
    const vencimiento = new Date(ahora);
    vencimiento.setMonth(vencimiento.getMonth() + 1);

    const pad = (n: number, l = 2) => String(n).padStart(l, '0');
    const fechaParte = `${ahora.getFullYear()}${pad(ahora.getMonth() + 1)}${pad(ahora.getDate())}`;
    const aleatorio = Math.floor(10000 + Math.random() * 90000);

    this.recetaEmitida = {
      numeroReceta: `REC-${fechaParte}-${aleatorio}`,
      // Hacemos el cast a 'any' por si getMedicoNombre no está definido estrictamente en el tipo base, o aplicamos un valor por defecto
      nombreMedico: (this.atencionService as any).getMedicoNombre ? (this.atencionService as any).getMedicoNombre() : 'Médico Tratante',
      nombrePaciente: this.pacienteActivo?.nombreCompleto ?? 'Paciente',
      fechaEmision: ahora,
      fechaVencimiento: vencimiento,
      items: [...this.receta]
    };

    setTimeout(() => { window.print(); }, 300);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}