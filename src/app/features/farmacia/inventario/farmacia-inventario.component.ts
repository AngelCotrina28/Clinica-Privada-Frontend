// ============================================================
// farmacia-inventario.component.ts
// Sub-sección: Control de Inventario y Medicamentos
// Ubicación: src/app/features/farmacia/inventario/farmacia-inventario.component.ts
// ============================================================

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MedicamentoService } from '../../../core/services/medicamento.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import {
  MedicamentoResponse,
  MedicamentoRequest,
  CategoriaResponse,
  HistorialMedicamento
} from '../farmacia.models';

@Component({
  selector: 'app-farmacia-inventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    DecimalPipe,
    DatePipe
  ],
  templateUrl: './farmacia-inventario.component.html',
  styleUrl: '../farmacia.component.scss'
})
export class FarmaciaInventarioComponent implements OnInit {

  // ── Estado ─────────────────────────────────────────────────
  medicamentos: MedicamentoResponse[] = [];
  categorias:   CategoriaResponse[]   = [];
  cargando      = signal(false);
  guardando     = signal(false);
  errorMensaje  = signal('');
  exitoMensaje  = signal('');

  // Paginación
  paginaActual   = 0;
  totalPaginas   = 0;
  totalElementos = 0;

  // Filtros
  filtros = { nombre: '', categoriaId: undefined as number | undefined, soloActivos: true };

  // Modales
  isModalOpen  = false;
  isEditMode   = false;
  medDetalle:  MedicamentoResponse | null = null;
  historialAbierto = false;
  historialItems:  HistorialMedicamento[] = [];
  private medEditandoId: number | null = null;

  // Formulario
  medForm!: FormGroup;

  // Auth
  usuarioNombre = '';
  esAdmin = false;

  constructor(
    private medService:  MedicamentoService,
    private authService: AuthService,
    private fb:          FormBuilder
  ) {}

  ngOnInit(): void {
    // Leer usuario/rol del token en sessionStorage
    const token = sessionStorage.getItem('token') ?? localStorage.getItem('token') ?? '';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.usuarioNombre = payload.sub ?? 'Farmacia';
        const rol = (payload.rol ?? payload.role ?? '').toUpperCase();
        this.esAdmin = rol === 'ADMINISTRADOR' || rol === 'ROLE_ADMINISTRADOR';
      } catch { this.usuarioNombre = 'Farmacia'; }
    }

    this.initForm();
    this.cargarCategorias();
    this.buscar();
  }

  // ── Formulario ──────────────────────────────────────────────
  private initForm(med?: MedicamentoResponse): void {
    this.medForm = this.fb.group({
      codigo:         [med?.codigo ?? '',    [Validators.required, Validators.maxLength(30)]],
      nombre:         [med?.nombre ?? '',    [Validators.required, Validators.maxLength(200)]],
      nombreGenerico: [med?.nombreGenerico ?? ''],
      descripcion:    [med?.descripcion ?? ''],
      categoriaId:    [med?.categoriaId ?? '', Validators.required],
      presentacion:   [med?.presentacion ?? '', Validators.maxLength(100)],
      laboratorio:    [med?.laboratorio ?? '', Validators.maxLength(150)],
      precioUnitario: [med?.precioUnitario ?? '', [Validators.required, Validators.min(0.01)]],
      stockInicial:   [0,  Validators.min(0)],
      stockMinimo:    [med?.stockMinimo ?? 0, Validators.min(0)],
      requiereReceta: [med?.requiereReceta ?? false]
    });
  }

  // ── Carga de datos ──────────────────────────────────────────
  cargarCategorias(): void {
    this.medService.listarCategorias().subscribe({
      next: cats => this.categorias = cats,
      error: () => {} // no crítico
    });
  }

  buscar(): void {
    this.cargando.set(true);
    this.medService.buscar({
      nombre:      this.filtros.nombre || undefined,
      categoriaId: this.filtros.categoriaId,
      soloActivos: this.filtros.soloActivos,
      pagina:      this.paginaActual,
      tamano:      20
    }).subscribe({
      next: page => {
        this.medicamentos    = page.contenido;
        this.totalPaginas    = page.totalPaginas;
        this.totalElementos  = page.totalElementos;
        this.cargando.set(false);
      },
      error: e => {
        this.errorMensaje.set(e.error?.mensaje ?? 'Error al cargar medicamentos.');
        this.cargando.set(false);
      }
    });
  }

  limpiarFiltros(): void {
    this.filtros = { nombre: '', categoriaId: undefined, soloActivos: true };
    this.paginaActual = 0;
    this.buscar();
  }

  cambiarPagina(p: number): void {
    this.paginaActual = p;
    this.buscar();
  }

  // ── Acciones de tabla ───────────────────────────────────────
  verDetalle(med: MedicamentoResponse): void {
    this.medDetalle = med;
  }

  verHistorial(med: MedicamentoResponse): void {
    this.medService.historial(med.id).subscribe({
      next: (page: any) => {
        this.historialItems  = page.content ?? page.contenido ?? [];
        this.historialAbierto = true;
      },
      error: () => this.errorMensaje.set('Error al cargar historial.')
    });
  }

  toggleEstado(med: MedicamentoResponse): void {
    const estadoOriginal = med.activo;

    const peticionHttp = estadoOriginal
      ? this.medService.inactivar(med.id)
      : this.medService.activar(med.id);
    
    this.cargando.set(true);

    peticionHttp.subscribe({
      next: (response) => {
        // Find index del elemento mutado
        const idx = this.medicamentos.findIndex(m => m.id === med.id);
        
        if (idx !== -1) {
          this.medicamentos[idx] = {
            ...this.medicamentos[idx],
            activo: !estadoOriginal
          };
        }
        
        this.exitoMensaje.set(`Medicamento "${med.nombre}" ${estadoOriginal ? 'inactivado' : 'activado'} correctamente en la base de datos.`);
        this.errorMensaje.set(''); // Limpiamos cualquier error previo
        this.cargando.set(false);
      },
      error: (err) => {
        // Si entra aquí, significa que la base de datos RECHAZÓ el cambio (ej: Error 403, 500, etc.)
        console.error('Error detallado desde Spring Boot:', err);
        
        // Aseguramos que la interfaz se quede en su estado real en la BD
        const idx = this.medicamentos.findIndex(m => m.id === med.id);
        if (idx !== -1) {
          this.medicamentos[idx].activo = estadoOriginal;
        }

        const mensajeError = err.error?.mensaje || err.message || 'No se pudo conectar con el servidor de la clínica.';
        this.errorMensaje.set(`No se pudo cambiar el estado: ${mensajeError}`);
        this.cargando.set(false);
      }
    });
  }

  // ── Modal Crear ─────────────────────────────────────────────
  abrirModalCrear(): void {
    this.isEditMode = false;
    this.medEditandoId = null;
    this.initForm();
    this.isModalOpen = true;
  }

  abrirModalEditar(med: MedicamentoResponse): void {
    this.isEditMode = true;
    this.medEditandoId = med.id;
    this.initForm(med);
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
  }

  cerrarModalSiOverlay(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cerrarModal();
    }
  }

  guardarMedicamento(): void {
    if (this.medForm.invalid) return;
    this.guardando.set(true);

    const dto: MedicamentoRequest = {
      ...this.medForm.value,
      categoriaId:    Number(this.medForm.value.categoriaId),
      precioUnitario: Number(this.medForm.value.precioUnitario),
      stockInicial:   Number(this.medForm.value.stockInicial),
      stockMinimo:    Number(this.medForm.value.stockMinimo)
    };

    const peticion = this.isEditMode && this.medEditandoId
      ? this.medService.editar(this.medEditandoId, dto)
      : this.medService.registrar(dto);

    peticion.subscribe({
      next: med => {
        if (this.isEditMode) {
          const idx = this.medicamentos.findIndex(m => m.id === med.id);
          if (idx !== -1) this.medicamentos[idx] = med;
        } else {
          this.medicamentos.unshift(med);
        }
        this.exitoMensaje.set(`Medicamento "${med.nombre}" guardado correctamente.`);
        this.cerrarModal();
        this.guardando.set(false);
      },
      error: e => {
        this.errorMensaje.set(e.error?.mensaje ?? 'Error al guardar medicamento.');
        this.guardando.set(false);
      }
    });
  }
}