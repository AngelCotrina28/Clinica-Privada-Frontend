import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MedicamentoService } from '../../../core/services/medicamento.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/header/header.component';
import {
  MedicamentoResponse,
  MedicamentoRequest,
  CategoriaResponse,
  HistorialMedicamento
} from '../../../core/model/farmacia.models';

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

  medicamentos: MedicamentoResponse[] = [];
  categorias:   CategoriaResponse[]   = [];
  cargando      = signal(false);
  guardando     = signal(false);
  errorMensaje  = signal('');
  exitoMensaje  = signal('');

  paginaActual   = 0;
  totalPaginas   = 0;
  totalElementos = 0;

  filtros = { nombre: '', categoriaId: undefined as number | undefined, soloActivos: true };

  isModalOpen  = false;
  isEditMode   = false;
  medDetalle:  MedicamentoResponse | null = null;
  historialAbierto = false;
  historialItems:  HistorialMedicamento[] = [];
  private medEditandoId: number | null = null;

  medForm!: FormGroup;

  usuarioNombre = '';
  esAdmin = false;

  // Temporizadores para los toasts
  private exitoTimeout: any;
  private errorTimeout: any;

  // Variables para modal de stock
  isStockModalOpen = false;
  medStockSeleccionado: MedicamentoResponse | null = null;
  cantidadStockAgregar = 0;

  constructor(
    private medService:  MedicamentoService,
    private authService: AuthService,
    private fb:          FormBuilder
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    this.usuarioNombre = usuario?.nombreCompleto || usuario?.username || 'Farmacia';
    this.esAdmin = usuario?.rol === 'ADMINISTRADOR';

    this.initForm();
    this.cargarCategorias();
    this.buscar();
  }

  private initForm(med?: MedicamentoResponse): void {
    this.medForm = this.fb.group({
      codigo:         [med?.codigo ?? '',    [Validators.maxLength(30)]],
      nombre:         [med?.nombre ?? '',    [Validators.required, Validators.maxLength(200)]],
      nombreGenerico: [med?.nombreGenerico ?? ''],
      descripcion:    [med?.descripcion ?? ''],
      categoriaId:    [med?.categoriaId ?? '', Validators.required],
      presentacion:   [med?.presentacion ?? '', Validators.maxLength(100)],
      laboratorio:    [med?.laboratorio ?? '', Validators.maxLength(150)],
      precioUnitario: [med?.precioUnitario ?? '', [Validators.required, Validators.min(0.01)]],
      stockInicial:   [0,  Validators.min(0)],
      stockActual:    [{value: med?.stockActual ?? 0, disabled: true}], // Campo de solo lectura para edición
      stockMinimo:    [med?.stockMinimo ?? 0, Validators.min(0)],
      requiereReceta: [med?.requiereReceta ?? false]
    });
  }

  // --- Lógica de Notificaciones (Toasts) ---
  
  mostrarMensajeExito(mensaje: string): void {
    this.exitoMensaje.set(mensaje);
    if (this.exitoTimeout) {
      clearTimeout(this.exitoTimeout);
    }
    this.exitoTimeout = setTimeout(() => {
      this.exitoMensaje.set('');
    }, 5000);
  }

  mostrarMensajeError(mensaje: string): void {
    this.errorMensaje.set(mensaje);
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
    this.errorTimeout = setTimeout(() => {
      this.errorMensaje.set('');
    }, 5000);
  }


  cargarCategorias(): void {
    this.medService.listarCategorias().subscribe({
      next: cats => this.categorias = cats,
      error: () => {}
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
        this.mostrarMensajeError(e.error?.mensaje ?? 'Error al cargar medicamentos.');
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

  verDetalle(med: MedicamentoResponse): void {
    this.medDetalle = med;
  }

  verHistorial(med: MedicamentoResponse): void {
    this.medService.historial(med.id).subscribe({
      next: (page: any) => {
        this.historialItems  = page.content ?? page.contenido ?? [];
        this.historialAbierto = true;
      },
      error: () => this.mostrarMensajeError('Error al cargar historial.')
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
        const idx = this.medicamentos.findIndex(m => m.id === med.id);
        
        if (idx !== -1) {
          this.medicamentos[idx] = {
            ...this.medicamentos[idx],
            activo: !estadoOriginal
          };
        }
        
        this.mostrarMensajeExito(`Medicamento "${med.nombre}" ${estadoOriginal ? 'inactivado' : 'activado'} correctamente en la base de datos.`);
        this.errorMensaje.set('');
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error detallado desde Spring Boot:', err);
        
        const idx = this.medicamentos.findIndex(m => m.id === med.id);
        if (idx !== -1) {
          this.medicamentos[idx].activo = estadoOriginal;
        }

        const mensajeError = err.error?.mensaje || err.message || 'No se pudo conectar con el servidor de la clínica.';
        this.mostrarMensajeError(`No se pudo cambiar el estado: ${mensajeError}`);
        this.cargando.set(false);
      }
    });
  }

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
      this.isStockModalOpen = false;
    }
  }

 guardarMedicamento(): void {
    if (this.medForm.invalid) return;
    this.guardando.set(true);

    const dtoTemporal: any = {
      ...this.medForm.value,
      categoriaId:    Number(this.medForm.value.categoriaId),
      precioUnitario: Number(this.medForm.value.precioUnitario),
      stockMinimo:    Number(this.medForm.value.stockMinimo)
    };

    if (!this.isEditMode) {
      dtoTemporal.stockInicial = Number(this.medForm.value.stockInicial);
    } else {
      dtoTemporal.stockInicial = 0; 
      delete dtoTemporal.stockActual;
    }

    const peticion = this.isEditMode && this.medEditandoId
      ? this.medService.editar(this.medEditandoId, dtoTemporal as MedicamentoRequest)
      : this.medService.registrar(dtoTemporal as MedicamentoRequest);

    peticion.subscribe({
      next: med => {
        if (this.isEditMode) {
          const idx = this.medicamentos.findIndex(m => m.id === med.id);
          if (idx !== -1) this.medicamentos[idx] = med;
        } else {
          this.medicamentos.unshift(med);
        }
        this.mostrarMensajeExito(`Medicamento "${med.nombre}" guardado correctamente.`);
        this.cerrarModal();
        this.guardando.set(false);
      },
      error: e => {
        const mensajeApi = e.error?.mensaje || e.error?.message || 'Error de validación al guardar.';
        this.mostrarMensajeError(mensajeApi);
        this.guardando.set(false);
      }
    });
  }

  abrirModalStock(med: MedicamentoResponse): void {
    this.medStockSeleccionado = med;
    this.cantidadStockAgregar = 1;
    this.isStockModalOpen = true;
  }

  guardarNuevoStock(): void {
    if (!this.medStockSeleccionado || this.cantidadStockAgregar <= 0) return;
    this.guardando.set(true);

    this.medService.agregarStock(this.medStockSeleccionado.id, this.cantidadStockAgregar).subscribe({
      next: (medActualizado) => {
        const idx = this.medicamentos.findIndex(m => m.id === medActualizado.id);
        if (idx !== -1) {
          this.medicamentos[idx].stockActual = medActualizado.stockActual;
        }
        
        this.mostrarMensajeExito(`Se agregaron ${this.cantidadStockAgregar} unidades. Nuevo stock: ${medActualizado.stockActual}`);
        this.isStockModalOpen = false;
        this.guardando.set(false);
      },
      error: (e) => {
        this.mostrarMensajeError(e.error?.mensaje ?? 'Error al actualizar el stock.');
        this.guardando.set(false);
      }
    });
  }
}