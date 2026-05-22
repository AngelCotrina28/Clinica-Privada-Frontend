import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HeaderComponent } from '../../../shared/header/header.component';
import {
  AbrirHistoriaRequest,
  GenerarOrdenRequest,
  HistoriaClinicaResponse,
  MedicoDisponible,
  OrdenEmergenciaResponse
} from '../admision.models';

@Component({
  selector: 'app-admision-emergencia',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './admision-emergencia.component.html',
  styleUrl: '../admision.component.scss'
})
export class AdmisionEmergenciaComponent implements OnInit {
  private readonly API = 'http://localhost:8080/api';

  medicos = signal<MedicoDisponible[]>([]);
  ordenesHoy = signal<OrdenEmergenciaResponse[]>([]);
  ordenGenerada = signal<OrdenEmergenciaResponse | null>(null);
  orden: GenerarOrdenRequest = { historiaClinicaId: null, medicoId: null, motivo: '' };

  dniBusqueda = '';
  mostrarFormNueva = false;
  historiaSeleccionada = signal<HistoriaClinicaResponse | null>(null);
  nuevaHistoria: AbrirHistoriaRequest = this.initHistoria();

  cargando = signal(false);
  cargandoHistoria = signal(false);
  cargandoMedicos = signal(false);
  errorMensaje = signal('');
  exitoMensaje = signal('');

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

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

  cargarOrdenesHoy(): void {
    // Nota: Asegúrate de que este endpoint exista en tu backend Spring Boot
    this.http.get<OrdenEmergenciaResponse[]>(`${this.API}/admision/emergencia/ordenes/hoy`).subscribe({
      next: (ordenes) => {
        this.ordenesHoy.set(ordenes);
      },
      error: (e: HttpErrorResponse) => {
        console.error('Error al cargar las órdenes de hoy', e);
      }
    });
  }

  mostrarToastExito(mensaje: string): void {
    this.exitoMensaje.set(mensaje);
    
    setTimeout(() => {
      // Solo limpiamos si el mensaje actual es el mismo (evita que un nuevo toast se borre prematuramente)
      if (this.exitoMensaje() === mensaje) {
        this.exitoMensaje.set('');
      }
    }, 4500);
  }

  buscarHistoria(): void {
    if (!this.dniBusqueda.trim()) return;
    this.limpiarMensajes();
    this.limpiarHistoriaSeleccionada();
    this.cargandoHistoria.set(true);
    this.http.get<HistoriaClinicaResponse>(
      `${this.API}/admision/historia?dni=${encodeURIComponent(this.dniBusqueda.trim())}`
    ).subscribe({
      next: h => {
        this.seleccionarHistoria(h);
        this.cargandoHistoria.set(false);
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 404) {
          this.mostrarFormNueva = true;
          this.nuevaHistoria.dniPaciente = this.dniBusqueda.trim();
        } else {
          this.errorMensaje.set(e.error?.mensaje ?? 'Error al buscar la historia.');
        }
        this.cargandoHistoria.set(false);
      }
    });
  }

  abrirNuevaHistoria(form: NgForm): void {
    if (form.invalid) return;
    this.limpiarMensajes();
    this.cargandoHistoria.set(true);
    this.nuevaHistoria.desdeAdmision = true;
    this.http.post<HistoriaClinicaResponse>(`${this.API}/admision/historia`, this.nuevaHistoria).subscribe({
      next: resp => {
        this.seleccionarHistoria(resp);
        this.dniBusqueda = resp.dniPaciente;
        this.mostrarFormNueva = false;
        this.nuevaHistoria = this.initHistoria();
        this.mostrarToastExito(`Historia ${resp.numeroHistoria} creada. Continue con la orden de emergencia.`);
        this.cargandoHistoria.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.errorMensaje.set(e.error?.mensaje ?? 'Error al crear la historia.');
        this.cargandoHistoria.set(false);
      }
    });
  }

  cancelarNueva(): void {
    this.mostrarFormNueva = false;
    this.nuevaHistoria = this.initHistoria();
    this.limpiarMensajes();
  }

  cargarMedicos(): void {
    this.cargandoMedicos.set(true);
    this.http.get<MedicoDisponible[]>(`${this.API}/trabajadores/medicos/activos`).subscribe({
      next: list => { this.medicos.set(list); this.cargandoMedicos.set(false); },
      error: () => { this.errorMensaje.set('No se pudieron cargar los medicos.'); this.cargandoMedicos.set(false); }
    });
  }

  generarOrden(form: NgForm): void {
    if (form.invalid || !this.orden.medicoId || !this.orden.historiaClinicaId) return;
    this.limpiarMensajes();
    this.cargando.set(true);
    this.http.post<OrdenEmergenciaResponse>(`${this.API}/admision/emergencia/orden`, this.orden).subscribe({
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

  limpiarHistoriaSeleccionada(): void {
    this.historiaSeleccionada.set(null);
    this.orden.historiaClinicaId = null;
  }

  private seleccionarHistoria(historia: HistoriaClinicaResponse): void {
    this.historiaSeleccionada.set(historia);
    this.orden.historiaClinicaId = historia.id;
    this.mostrarFormNueva = false;
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
}