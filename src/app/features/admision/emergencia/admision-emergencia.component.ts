import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { HeaderComponent } from '../../../shared/header/header.component';
import { AdmisionService } from '../../../core/services/admision.service';
import {
  AbrirHistoriaRequest,
  GenerarOrdenRequest,
  HistoriaClinicaResponse,
  MedicoDisponible,
  OrdenEmergenciaResponse
} from '../../../core/model/admision.models';
import {
  limpiarDocumentoPaciente,
  maxDocumentoPaciente,
  mensajeDocumentoPaciente,
  patronDocumentoPaciente,
  TipoDocumentoPaciente
} from '../documento-paciente.util';

@Component({
  selector: 'app-admision-emergencia',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './admision-emergencia.component.html',
  styleUrl: '../admision.component.scss'
})
export class AdmisionEmergenciaComponent implements OnInit {
  private admisionService = inject(AdmisionService);
  private route = inject(ActivatedRoute);

  medicos = signal<MedicoDisponible[]>([]);
  ordenesHoy = signal<OrdenEmergenciaResponse[]>([]);
  ordenGenerada = signal<OrdenEmergenciaResponse | null>(null);
  orden: GenerarOrdenRequest = { historiaClinicaId: null, medicoId: null, motivo: '' };
  fechaImpresion: Date = new Date();
  dniBusqueda = '';
  tipoDocumentoBusqueda: TipoDocumentoPaciente = 'DNI';
  tipoDocumentoNueva: TipoDocumentoPaciente = 'DNI';
  documentoBusquedaTocado = false;
  documentoNuevaTocado = false;

  mostrarFormNueva = false;
  historiaSeleccionada = signal<HistoriaClinicaResponse | null>(null);
  nuevaHistoria: AbrirHistoriaRequest = this.initHistoria();

  cargando = signal(false);
  cargandoHistoria = signal(false);
  cargandoMedicos = signal(false);
  errorMensaje = signal('');
  exitoMensaje = signal('');

  ngOnInit(): void {
    this.cargarMedicos();
    this.cargarOrdenesHoy();

    this.route.queryParams.subscribe(p => {
      if (p['historiaId']) {
        this.seleccionarHistoria({
          id: +p['historiaId'],
          numeroHistoria: p['numeroHistoria'] ?? '',
          dniPaciente: '',
          nombreCompleto: p['nombre'] ?? '',
          creadoPor: '',
          createdAt: '',
          nuevaHistoria: false
        });
      }
    });
  }

  // CARGAR ÓRDENES DE HOY (Delegado al servicio)
  cargarOrdenesHoy(): void {
    this.admisionService.cargarOrdenesHoy().subscribe({
      next: (ordenes) => {
        this.ordenesHoy.set(ordenes);
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al cargar las órdenes de hoy', e);
      }
    });
  }

  // BUSCAR HISTORIA CLÍNICA
  buscarHistoria(): void {
    this.documentoBusquedaTocado = true;
    this.dniBusqueda = limpiarDocumentoPaciente(this.tipoDocumentoBusqueda, this.dniBusqueda);
    const errorDocumento = this.documentoBusquedaError();
    if (errorDocumento) {
      this.errorMensaje.set(errorDocumento);
      return;
    }

    this.limpiarMensajes();
    this.limpiarHistoriaSeleccionada();
    this.cargandoHistoria.set(true);

    this.admisionService.buscarHistoria(this.dniBusqueda.trim()).subscribe({
      next: h => {
        this.seleccionarHistoria(h);
        this.cargandoHistoria.set(false);
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 404) {
          this.tipoDocumentoNueva = this.tipoDocumentoBusqueda;
          this.mostrarFormNueva = true;
          this.documentoNuevaTocado = false;
          this.nuevaHistoria = { ...this.initHistoria(), dniPaciente: this.dniBusqueda.trim() };
        } else {
          this.errorMensaje.set(e.error?.mensaje ?? 'Error al buscar la historia.');
        }
        this.cargandoHistoria.set(false);
      }
    });
  }

  // REGISTRAR NUEVA HISTORIA (Delegado al servicio)
  abrirNuevaHistoria(form: NgForm): void {
    this.documentoNuevaTocado = true;
    this.nuevaHistoria.dniPaciente = limpiarDocumentoPaciente(this.tipoDocumentoNueva, this.nuevaHistoria.dniPaciente);
    const errorDocumento = this.documentoNuevaError();
    if (form.invalid || errorDocumento) {
      if (errorDocumento) this.errorMensaje.set(errorDocumento);
      return;
    }

    this.limpiarMensajes();
    this.cargandoHistoria.set(true);
    this.nuevaHistoria.desdeAdmision = true;

    this.admisionService.abrirNuevaHistoria(this.nuevaHistoria).subscribe({
      next: resp => {
        this.seleccionarHistoria(resp);
        this.dniBusqueda = resp.dniPaciente;
        this.mostrarFormNueva = false;
        this.nuevaHistoria = this.initHistoria();
        this.documentoNuevaTocado = false;
        this.mostrarToastExito(`Historia ${resp.numeroHistoria} creada. Continúe con la orden de emergencia.`);
        this.cargandoHistoria.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.errorMensaje.set(e.error?.mensaje ?? 'Error al crear la historia.');
        this.cargandoHistoria.set(false);
      }
    });
  }

  // CARGAR MÉDICOS ACTIVOS
  cargarMedicos(): void {
    this.cargandoMedicos.set(true);
    this.admisionService.cargarMedicos().subscribe({
      next: list => {
        this.medicos.set(list);
        this.cargandoMedicos.set(false);
      },
      error: () => {
        this.errorMensaje.set('No se pudieron cargar los médicos.');
        this.cargandoMedicos.set(false);
      }
    });
  }

  // GENERAR ORDEN DE ATENCIÓN DE EMERGENCIA
  generarOrden(form: NgForm): void {
    if (form.invalid || !this.orden.medicoId || !this.orden.historiaClinicaId) return;
    this.limpiarMensajes();
    this.cargando.set(true);

    this.admisionService.generarOrden(this.orden).subscribe({
      next: o => {
        this.ordenGenerada.set(o);
        this.ordenesHoy.update(l => [o, ...l]);
        this.mostrarToastExito(`Orden ${o.numeroOrden} asignada a ${o.nombreMedico}.`);
        this.cargando.set(false);
        this.orden = { historiaClinicaId: this.historiaSeleccionada()?.id ?? null, medicoId: null, motivo: '' };
        form.resetForm({ historiaClinicaId: this.orden.historiaClinicaId });
      },
      error: (e: HttpErrorResponse) => {
        this.errorMensaje.set(
          e.status === 403
            ? 'Sin permiso. Se requiere JEFE_ENFERMERIA o ADMINISTRADOR.'
            : (e.error?.mensaje ?? 'Error al generar la orden.')
        );
        this.cargando.set(false);
      }
    });
  }

  // MÉTODOS DE CONTROL VISUAL INTERNO
  actualizarDocumentoBusqueda(valor: string): void {
    this.dniBusqueda = limpiarDocumentoPaciente(this.tipoDocumentoBusqueda, valor);
  }

  cambiarTipoDocumentoBusqueda(tipo: TipoDocumentoPaciente): void {
    this.tipoDocumentoBusqueda = tipo;
    this.dniBusqueda = limpiarDocumentoPaciente(tipo, this.dniBusqueda);
    this.documentoBusquedaTocado = !!this.dniBusqueda;
  }

  actualizarDocumentoNueva(valor: string): void {
    this.nuevaHistoria.dniPaciente = limpiarDocumentoPaciente(this.tipoDocumentoNueva, valor);
  }

  cambiarTipoDocumentoNueva(tipo: TipoDocumentoPaciente): void {
    this.tipoDocumentoNueva = tipo;
    this.nuevaHistoria.dniPaciente = limpiarDocumentoPaciente(tipo, this.nuevaHistoria.dniPaciente);
    this.documentoNuevaTocado = !!this.nuevaHistoria.dniPaciente;
  }

  documentoBusquedaError(): string {
    return mensajeDocumentoPaciente(this.tipoDocumentoBusqueda, this.dniBusqueda);
  }

  documentoNuevaError(): string {
    return mensajeDocumentoPaciente(this.tipoDocumentoNueva, this.nuevaHistoria.dniPaciente);
  }

  documentoBusquedaValido(): boolean {
    return !this.documentoBusquedaError();
  }

  puedeAbrirFormularioHistoria(): boolean {
    return !this.cargandoHistoria() && (!this.dniBusqueda.trim() || this.documentoBusquedaValido());
  }

  maxDocumento(tipo: TipoDocumentoPaciente): number {
    return maxDocumentoPaciente(tipo);
  }

  patronDocumento(tipo: TipoDocumentoPaciente): string {
    return patronDocumentoPaciente(tipo);
  }

  prepararNuevaHistoria(): void {
    this.limpiarMensajes();

    if (this.dniBusqueda.trim()) {
      this.documentoBusquedaTocado = true;
      this.dniBusqueda = limpiarDocumentoPaciente(this.tipoDocumentoBusqueda, this.dniBusqueda);
      const errorDocumento = this.documentoBusquedaError();
      if (errorDocumento) {
        this.errorMensaje.set(errorDocumento);
        return;
      }
    }

    this.tipoDocumentoNueva = this.tipoDocumentoBusqueda;
    this.nuevaHistoria = { ...this.initHistoria(), dniPaciente: this.dniBusqueda.trim() };
    this.documentoNuevaTocado = false;
    this.mostrarFormNueva = true;
    this.limpiarHistoriaSeleccionada();
  }

  cancelarNueva(): void {
    this.mostrarFormNueva = false;
    this.nuevaHistoria = this.initHistoria();
    this.documentoNuevaTocado = false;
    this.limpiarMensajes();
  }

  limpiarHistoriaSeleccionada(): void {
    this.historiaSeleccionada.set(null);
    this.orden.historiaClinicaId = null;
  }

  private seleccionarHistoria(historia: HistoriaClinicaResponse): void {
    this.historiaSeleccionada.set(historia);
    this.orden.historiaClinicaId = historia.id;
    this.mostrarFormNueva = false;
    this.documentoNuevaTocado = false;
  }

  private initHistoria(): AbrirHistoriaRequest {
    return {
      dniPaciente: '',
      nombreCompleto: '',
      telefono: '',
      email: '',
      fechaNacimiento: '',
      genero: '',
      direccion: '',
      desdeAdmision: true
    };
  }

  private limpiarMensajes(): void {
    this.errorMensaje.set('');
    this.exitoMensaje.set('');
  }

  mostrarToastExito(mensaje: string): void {
    this.exitoMensaje.set(mensaje);
    setTimeout(() => {
      if (this.exitoMensaje() === mensaje) {
        this.exitoMensaje.set('');
      }
    }, 4500);
  }

  imprimirOrden(): void {
    this.fechaImpresion = new Date();
    setTimeout(() => {
      window.print();
    }, 50);
  }
}