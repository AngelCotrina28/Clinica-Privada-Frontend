import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AtencionMedicaService } from '../../../core/services/atencion-medica.service';
import { MedicamentoService, MedicamentoOpcion } from '../../../core/services/medicamento.service';
import { HistoriaClinicaResponse } from '../../../core/model/historia-clinica.model';

export interface ItemReceta {
  medicamento: string;
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
  selector: 'app-receta-medica',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe],
  templateUrl: './receta-medica.component.html',
  styleUrl: './receta-medica.component.scss'
})
export class RecetaMedicaComponent implements OnInit {

  private atencionService  = inject(AtencionMedicaService);
  private medicamentoService = inject(MedicamentoService);

  pacienteActivo: HistoriaClinicaResponse | null = null;

  // ── Autocomplete ──────────────────────────────────────
  todosMedicamentos: MedicamentoOpcion[] = [];
  medicamentosFiltrados: MedicamentoOpcion[] = [];
  medicamentoInput: string = '';
  mostrarSugerencias: boolean = false;

  // ── Campos del ítem a agregar ─────────────────────────
  diasInput: number | null = null;
  cantidadInput: number | null = null;
  indicacionesInput: string = '';

  // ── Lista de la receta ────────────────────────────────
  receta: ItemReceta[] = [];

  // ── Datos de la receta ya emitida (para imprimir) ─────
  recetaEmitida: RecetaEmitida | null = null;

  ngOnInit() {
    this.atencionService.pacienteActivo$.subscribe(paciente => {
      this.pacienteActivo = paciente;
    });

    this.medicamentoService.obtenerTodosParaReceta().subscribe({
      next: (lista) => { this.todosMedicamentos = lista; },
      error: (err) => { console.error('Error al cargar medicamentos', err); }
    });
  }

  // ── Autocomplete ──────────────────────────────────────

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
    setTimeout(() => { this.mostrarSugerencias = false; }, 200);
  }

  // ── Solo números ──────────────────────────────────────

  soloNumeros(event: KeyboardEvent) {
    const char = event.which ?? event.keyCode;
    if (char < 48 || char > 57) event.preventDefault();
  }

  // ── Añadir / quitar ───────────────────────────────────

  agregarMedicamento() {
    const nombre = this.medicamentoInput.trim();
    if (!nombre) { alert('Seleccione o escriba un medicamento.'); return; }
    if (!this.diasInput || this.diasInput < 1) { alert('Ingrese un número de días válido.'); return; }
    if (!this.cantidadInput || this.cantidadInput < 1) { alert('Ingrese una cantidad válida.'); return; }

    if (this.receta.some(i => i.medicamento.toLowerCase() === nombre.toLowerCase())) {
      alert('Este medicamento ya fue añadido a la receta.'); return;
    }

    this.receta.push({
      medicamento: nombre,
      dias: this.diasInput,
      cantidad: this.cantidadInput,
      indicaciones: this.indicacionesInput.trim()
    });

    // Limpiar campos
    this.medicamentoInput = '';
    this.diasInput = null;
    this.cantidadInput = null;
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
      nombreMedico: this.atencionService.getMedicoNombre() ?? 'Médico',
      nombrePaciente: this.pacienteActivo?.nombreCompleto ?? 'Paciente',
      fechaEmision: ahora,
      fechaVencimiento: vencimiento,
      items: [...this.receta]
    };

    setTimeout(() => { window.print(); }, 300);
  }
}