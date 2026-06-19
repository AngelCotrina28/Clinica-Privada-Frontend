import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MedicamentoService } from '../../../core/services/medicamento.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { MedicamentoResponse } from '../../../core/model/farmacia.models';

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

  constructor(
    private medService: MedicamentoService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    this.usuarioNombre = usuario?.nombreCompleto || usuario?.username || 'Farmacia';
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
