import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { RecetaService } from '../../../core/services/Receta.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import { RecetaResponse } from '../../../core/model/Receta.model';

@Component({
  selector: 'app-farmacia-despacho',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './farmacia-despacho.component.html',
  styleUrl: '../farmacia.component.scss'
})
export class FarmaciaDespachoComponent implements OnInit {

  usuarioNombre    = '';
  terminoBusqueda  = '';
  cargandoBusqueda = signal(false);
  errorMensaje     = signal('');
  exitoMensaje     = signal('');
  confirmando      = signal(false);

  /** Resultados de la búsqueda dual (N° de receta o DNI). */
  recetasEncontradas: RecetaResponse[] = [];

  /** Receta abierta en el modal de confirmación de despacho. */
  recetaSeleccionada: RecetaResponse | null = null;

  constructor(
    private authService: AuthService,
    private recetaService: RecetaService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    this.usuarioNombre = usuario?.nombreCompleto || usuario?.username || 'Farmacia';
  }

  buscarOrden(): void {
    const termino = this.terminoBusqueda.trim();
    this.errorMensaje.set('');

    if (!termino) {
      this.recetasEncontradas = [];
      return;
    }

    this.cargandoBusqueda.set(true);

    this.recetaService.buscar(termino).subscribe({
      next: (recetas) => {
        this.recetasEncontradas = recetas;
        this.cargandoBusqueda.set(false);
      },
      error: (err) => {
        this.recetasEncontradas = [];
        this.errorMensaje.set(err.error?.mensaje || 'No se encontró ninguna receta con ese criterio.');
        this.cargandoBusqueda.set(false);
      }
    });
  }

  /** El técnico de farmacia solo visualiza el detalle; no puede editarlo. */
  verDetalleReceta(receta: RecetaResponse): void {
    this.recetaSeleccionada = receta;
  }

  /** True si la receta seleccionada ya fue despachada anteriormente. */
  get recetaYaDespachada(): boolean {
    return this.recetaSeleccionada?.estado === 'DESPACHADA';
  }

  confirmarEntrega(): void {
    if (!this.recetaSeleccionada || this.recetaYaDespachada) {
      return;
    }

    const receta = this.recetaSeleccionada;
    this.confirmando.set(true);

    this.recetaService.despachar(receta.id).subscribe({
      next: (recetaActualizada) => {
        // Refleja el nuevo estado tanto en la lista como en el modal.
        const idx = this.recetasEncontradas.findIndex(r => r.id === recetaActualizada.id);
        if (idx !== -1) {
          this.recetasEncontradas[idx] = recetaActualizada;
        }

        this.exitoMensaje.set(`Receta ${recetaActualizada.numeroReceta} despachada correctamente.`);
        this.confirmando.set(false);
        this.recetaSeleccionada = null;
      },
      error: (err) => {
        this.errorMensaje.set(err.error?.mensaje || 'No se pudo confirmar el despacho de la receta.');
        this.confirmando.set(false);
      }
    });
  }

  cerrarModal(): void {
    this.recetaSeleccionada = null;
  }

  imprimirOrden(receta: RecetaResponse): void {
    window.print();
  }
}