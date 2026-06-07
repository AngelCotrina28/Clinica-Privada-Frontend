import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/header/header.component';
import { OrdenEmergenciaResponse, PageResponse } from '../../../core/model/admision.models';
import { environment } from '../../../../environments/environment';

interface FiltrosAuditoriaOrdenes {
  desde: string;
  hasta: string;
  busqueda: string;
}

@Component({
  selector: 'app-admision-auditoria-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './admision-auditoria-ordenes.component.html',
  styleUrls: ['../admision.component.scss', './admision-auditoria-ordenes.component.scss']
})
export class AdmisionAuditoriaOrdenesComponent implements OnInit {
  private readonly API = environment.apiUrl;
  private readonly TAMANO_PAGINA = 10;

  filtros: FiltrosAuditoriaOrdenes = {
    desde: '',
    hasta: '',
    busqueda: ''
  };

  resultado = signal<PageResponse<OrdenEmergenciaResponse>>(this.resultadoVacio());
  cargando = signal(false);
  errorMensaje = signal('');

  ordenes = computed(() => this.resultado().contenido);
  totalElementos = computed(() => this.resultado().totalElementos);

  ngOnInit(): void {
    this.buscar(0);
  }

  aplicarFiltros(): void {
    this.buscar(0);
  }

  limpiarFiltros(): void {
    this.filtros = {
      desde: '',
      hasta: '',
      busqueda: ''
    };
    this.buscar(0);
  }

  cambiarPagina(pagina: number): void {
    const totalPaginas = this.resultado().totalPaginas;
    if (pagina < 0 || pagina >= totalPaginas || pagina === this.resultado().paginaActual) return;
    this.buscar(pagina);
  }

  paginasVisibles(): number[] {
    const total = this.resultado().totalPaginas;
    if (total <= 0) return [];

    const actual = this.resultado().paginaActual;
    const inicio = Math.max(0, Math.min(actual - 2, total - 5));
    const fin = Math.min(total, inicio + 5);

    return Array.from({ length: fin - inicio }, (_, i) => inicio + i);
  }

  inicioResultado(): number {
    if (this.totalElementos() === 0) return 0;
    return this.resultado().paginaActual * this.TAMANO_PAGINA + 1;
  }

  finResultado(): number {
    return Math.min((this.resultado().paginaActual + 1) * this.TAMANO_PAGINA, this.totalElementos());
  }

  estadoClase(estado: string): string {
    return `estado-badge estado-badge--${estado.toLowerCase().replace('_', '-')}`;
  }

  private buscar(pagina: number): void {
    if (this.filtros.desde && this.filtros.hasta && this.filtros.desde > this.filtros.hasta) {
      this.errorMensaje.set('La fecha Desde no puede ser mayor que la fecha Hasta.');
      return;
    }

    this.errorMensaje.set('');
    this.cargando.set(true);

    let params = new HttpParams()
      .set('page', pagina)
      .set('size', this.TAMANO_PAGINA);

    if (this.filtros.desde) params = params.set('desde', this.filtros.desde);
    if (this.filtros.hasta) params = params.set('hasta', this.filtros.hasta);
    if (this.filtros.busqueda.trim()) params = params.set('busqueda', this.filtros.busqueda.trim());

    this.http.get<PageResponse<OrdenEmergenciaResponse>>(`${this.API}/admision/emergencia/ordenes`, { params })
      .subscribe({
        next: response => {
          this.resultado.set(response);
          this.cargando.set(false);
        },
        error: (e: HttpErrorResponse) => {
          this.errorMensaje.set(
            e.status === 403
              ? 'Sin permiso. Se requiere JEFE_ENFERMERIA o ADMINISTRADOR.'
              : (e.error?.mensaje ?? 'No se pudo consultar la auditoria de ordenes.')
          );
          this.resultado.set(this.resultadoVacio());
          this.cargando.set(false);
        }
      });
  }

  private resultadoVacio(): PageResponse<OrdenEmergenciaResponse> {
    return {
      contenido: [],
      paginaActual: 0,
      totalPaginas: 0,
      totalElementos: 0,
      ultima: true
    };
  }

  constructor(private http: HttpClient) {}
}
