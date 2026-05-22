// ============================================================
// farmacia-despacho.component.ts
// Sub-sección: Despacho de Medicamentos
// Ubicación: src/app/features/farmacia/despacho/farmacia-despacho.component.ts
//
// NOTA: Las órdenes de despacho dependen del módulo de Caja/Facturación
// (que aún no tiene su endpoint). Se usa data de demo con la estructura
// real para que cuando el endpoint exista solo cambie el servicio.
// ============================================================

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/header/header.component';

export interface OrdenDespacho {
  nroReceta:   string;
  paciente:    string;
  dni:         string;
  origen:      string;
  medicamentos: string[];
  estadoPago:  string;
}

@Component({
  selector: 'app-farmacia-despacho',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './farmacia-despacho.component.html',
  styleUrl: '../farmacia.component.scss'
})
export class FarmaciaDespachoComponent implements OnInit {

  usuarioNombre     = '';
  terminoBusqueda   = '';
  cargandoBusqueda  = signal(false);
  errorMensaje      = signal('');
  exitoMensaje      = signal('');
  confirmando       = signal(false);
  ordenSeleccionada: OrdenDespacho | null = null;

  // Demo: en producción esto vendrá del endpoint de órdenes pagadas
  ordenesPendientes: OrdenDespacho[] = [
    {
      nroReceta:    'REC-9921',
      paciente:     'María Gómez',
      dni:          '45678901',
      origen:       'Consulta Externa',
      medicamentos: ['Paracetamol 500mg x 20', 'Ibuprofeno 400mg x 10'],
      estadoPago:   'Pagado'
    },
    {
      nroReceta:    'REC-9922',
      paciente:     'Juan Flores',
      dni:          '32145678',
      origen:       'Emergencia',
      medicamentos: ['Amoxicilina 500mg x 21'],
      estadoPago:   'Pendiente'
    }
  ];

  private readonly todasLasOrdenes: OrdenDespacho[] = [...this.ordenesPendientes];

  ngOnInit(): void {
    const token = sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? '';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.usuarioNombre = payload.sub ?? 'Farmacia';
      } catch { this.usuarioNombre = 'Farmacia'; }
    }
  }

  buscarOrden(): void {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    if (!termino) {
      this.ordenesPendientes = [...this.todasLasOrdenes];
      return;
    }
    this.cargandoBusqueda.set(true);
    // Filtro local hasta que exista endpoint real
    setTimeout(() => {
      this.ordenesPendientes = this.todasLasOrdenes.filter(o =>
        o.nroReceta.toLowerCase().includes(termino) ||
        o.dni.includes(termino) ||
        o.paciente.toLowerCase().includes(termino)
      );
      this.cargandoBusqueda.set(false);
    }, 300);
  }

  registrarEntrega(orden: OrdenDespacho): void {
    if (orden.estadoPago !== 'Pagado') return;
    this.ordenSeleccionada = orden;
  }

  confirmarEntrega(): void {
    if (!this.ordenSeleccionada) return;
    this.confirmando.set(true);

    // TODO: llamar endpoint POST /api/farmacia/despacho cuando esté disponible
    // Por ahora simula éxito y retira la orden de la lista
    setTimeout(() => {
      this.ordenesPendientes = this.ordenesPendientes.filter(
        o => o.nroReceta !== this.ordenSeleccionada!.nroReceta
      );
      this.exitoMensaje.set(`Entrega de ${this.ordenSeleccionada!.nroReceta} registrada correctamente.`);
      this.ordenSeleccionada = null;
      this.confirmando.set(false);
    }, 600);
  }

  imprimirOrden(orden: OrdenDespacho): void {
    // TODO: llamar endpoint de impresión / PDF cuando esté disponible
    window.print();
  }
}