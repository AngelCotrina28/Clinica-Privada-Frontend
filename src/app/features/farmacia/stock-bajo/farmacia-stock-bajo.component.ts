// ============================================================
// farmacia-stock-bajo.component.ts
// Sub-sección: Alertas de Stock Bajo
// Ubicación: src/app/features/farmacia/stock-bajo/farmacia-stock-bajo.component.ts
// ============================================================

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MedicamentoService } from '../../../core/services/medicamento.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { MedicamentoResponse } from '../farmacia.models';

@Component({
  selector: 'app-farmacia-stock-bajo',
  standalone: true,
  imports: [CommonModule, HeaderComponent, DecimalPipe],
  templateUrl: './farmacia-stock-bajo.component.html',
  styleUrl: '../farmacia.component.scss'
})
export class FarmaciaStockBajoComponent implements OnInit {

  usuarioNombre = '';
  medicamentos: MedicamentoResponse[] = [];
  cargando      = signal(false);
  errorMensaje  = signal('');
  paginaActual  = 0;
  totalPaginas  = 0;

  constructor(private medService: MedicamentoService) {}

  ngOnInit(): void {
    const token = sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? '';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.usuarioNombre = payload.sub ?? 'Farmacia';
      } catch { this.usuarioNombre = 'Farmacia'; }
    }
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.medService.stockBajo(this.paginaActual).subscribe({
      next: page => {
        this.medicamentos = page.contenido;
        this.totalPaginas = page.totalPaginas;
        this.cargando.set(false);
      },
      error: e => {
        this.errorMensaje.set(e.error?.mensaje ?? 'Error al cargar alertas de stock.');
        this.cargando.set(false);
      }
    });
  }

  cambiarPagina(p: number): void {
    this.paginaActual = p;
    this.cargar();
  }
}