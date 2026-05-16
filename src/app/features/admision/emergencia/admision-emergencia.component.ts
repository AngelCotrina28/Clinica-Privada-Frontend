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
  template: `
    <app-header titulo="Flujo de Emergencia" Trabajador="Recepcion Central" />

    <main class="contenedor">
      <section>
        <h2 class="subtitulo-seccion">Flujo de Emergencia</h2>

        @if (errorMensaje()) {
          <div class="alerta alerta--error"><span>!</span><p>{{ errorMensaje() }}</p><button (click)="errorMensaje.set('')">x</button></div>
        }
        @if (exitoMensaje()) {
          <div class="alerta alerta--exito"><span>OK</span><p>{{ exitoMensaje() }}</p><button (click)="exitoMensaje.set('')">x</button></div>
        }

        <div class="bloque">
          <h3 class="bloque__titulo">Verificar Historia Clinica</h3>
          <div class="grupo-acciones">
            <label class="campo__etiqueta" for="dni_paciente_emergencia">DNI / CE del Paciente:</label>
            <input id="dni_paciente_emergencia" type="text" class="campo__input"
              [(ngModel)]="dniBusqueda" placeholder="Ej: 12345678"
              maxlength="12" (keydown.enter)="buscarHistoria()" autocomplete="off" />
            <div class="grupo-botones">
              <button class="btn btn--primario" (click)="buscarHistoria()"
                [disabled]="cargandoHistoria() || !dniBusqueda.trim()">
                @if (cargandoHistoria()) { <span class="spinner"></span> } Buscar Historia
              </button>
              <button class="btn btn--contorno"
                (click)="mostrarFormNueva = true; nuevaHistoria.dniPaciente = dniBusqueda.trim(); limpiarHistoriaSeleccionada()">
                Abrir Nueva Historia
              </button>
            </div>
          </div>

          @if (historiaSeleccionada()) {
            <div class="resultado resultado--encontrado">
              <div class="resultado__cabecera">
                <span class="etiqueta etiqueta--encontrada">
                  {{ historiaSeleccionada()!.nuevaHistoria ? 'Historia Creada' : 'Encontrada' }}
                </span>
                <code class="resultado__num">{{ historiaSeleccionada()!.numeroHistoria }}</code>
              </div>
              <div class="resultado__grid">
                <div class="resultado__campo">
                  <span class="resultado__clave">Paciente</span>
                  <span class="resultado__valor">{{ historiaSeleccionada()!.nombreCompleto }}</span>
                </div>
                <div class="resultado__campo">
                  <span class="resultado__clave">DNI / CE</span>
                  <span class="resultado__valor">{{ historiaSeleccionada()!.dniPaciente || '-' }}</span>
                </div>
                <div class="resultado__campo">
                  <span class="resultado__clave">Historia ID</span>
                  <span class="resultado__valor">{{ historiaSeleccionada()!.id }}</span>
                </div>
              </div>
            </div>
          }
        </div>

        @if (mostrarFormNueva) {
          <div class="bloque bloque--nuevo">
            <h3 class="bloque__titulo">Datos del Nuevo Paciente</h3>
            <form #historiaForm="ngForm" (ngSubmit)="abrirNuevaHistoria(historiaForm)" novalidate>
              <div class="form-grid">
                <div class="campo">
                  <label class="campo__etiqueta">DNI / CE <span class="requerido">*</span></label>
                  <input type="text" class="campo__input" name="dniPaciente"
                    [(ngModel)]="nuevaHistoria.dniPaciente" required minlength="8" maxlength="12"
                    #dniF="ngModel" [class.campo__input--error]="dniF.invalid && dniF.touched" />
                  @if (dniF.invalid && dniF.touched) {
                    <span class="campo__error">DNI obligatorio (min. 8 caracteres)</span>
                  }
                </div>
                <div class="campo">
                  <label class="campo__etiqueta">Nombre Completo <span class="requerido">*</span></label>
                  <input type="text" class="campo__input" name="nombreCompleto"
                    [(ngModel)]="nuevaHistoria.nombreCompleto" required maxlength="150"
                    #nombreF="ngModel" [class.campo__input--error]="nombreF.invalid && nombreF.touched" />
                  @if (nombreF.invalid && nombreF.touched) {
                    <span class="campo__error">Nombre obligatorio</span>
                  }
                </div>
                <div class="campo">
                  <label class="campo__etiqueta">Telefono</label>
                  <input type="tel" class="campo__input" name="telefono"
                    [(ngModel)]="nuevaHistoria.telefono" maxlength="15" placeholder="987 654 321" />
                </div>
                <div class="campo">
                  <label class="campo__etiqueta">Email</label>
                  <input type="email" class="campo__input" name="email"
                    [(ngModel)]="nuevaHistoria.email" #emailF="ngModel"
                    [class.campo__input--error]="emailF.invalid && emailF.touched" />
                  @if (emailF.invalid && emailF.touched) {
                    <span class="campo__error">Formato de email invalido</span>
                  }
                </div>
                <div class="campo">
                  <label class="campo__etiqueta">Fecha de Nacimiento</label>
                  <input type="date" class="campo__input" name="fechaNacimiento"
                    [(ngModel)]="nuevaHistoria.fechaNacimiento" />
                </div>
                <div class="campo">
                  <label class="campo__etiqueta">Genero</label>
                  <select class="campo__input campo__select" name="genero" [(ngModel)]="nuevaHistoria.genero">
                    <option value="">-- Seleccionar --</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
                <div class="campo campo--full">
                  <label class="campo__etiqueta">Direccion</label>
                  <input type="text" class="campo__input" name="direccion"
                    [(ngModel)]="nuevaHistoria.direccion" placeholder="Av. Ejemplo 123, Lima" />
                </div>
              </div>
              <div class="grupo-botones grupo-botones--form">
                <button type="submit" class="btn btn--primario"
                  [disabled]="historiaForm.invalid || cargandoHistoria()">
                  @if (cargandoHistoria()) { <span class="spinner"></span> } Registrar y Continuar Emergencia
                </button>
                <button type="button" class="btn btn--ghost" (click)="cancelarNueva()">Cancelar</button>
              </div>
            </form>
          </div>
        }

        <div class="bloque">
          <h3 class="bloque__titulo">Generar Orden de Atencion de Emergencia</h3>

          @if (!orden.historiaClinicaId) {
            <div class="alerta alerta--info">
              <span>i</span>
              <p>Primero verifique o cree la historia clinica del paciente.</p>
            </div>
          }

          <form #ordenForm="ngForm" (ngSubmit)="generarOrden(ordenForm)" novalidate>
            <div class="campo">
              <label class="campo__etiqueta">Asignar Medico (Disponibles): <span class="requerido">*</span></label>
              @if (cargandoMedicos()) {
                <div class="cargando-inline"><span class="spinner spinner--teal"></span> Cargando medicos...</div>
              }
              @if (!cargandoMedicos() && medicos().length === 0) {
                <div class="sin-datos">
                  <span>Sin medicos cargados.</span>
                  <button type="button" class="btn btn--sm btn--contorno" (click)="cargarMedicos()">Cargar</button>
                </div>
              }
              @if (medicos().length > 0) {
                <select class="campo__input campo__select" name="medicoId"
                  [(ngModel)]="orden.medicoId" required #medF="ngModel"
                  [class.campo__input--error]="medF.invalid && medF.touched">
                  <option [ngValue]="null" disabled>-- Seleccionar medico --</option>
                  @for (m of medicos(); track m.id) {
                    <option [ngValue]="m.id">
                      Dr/a. {{ m.nombreCompleto }}
                      {{ m.especialidades.length ? '(' + m.especialidades.join(', ') + ')' : '(Medicina General)' }}
                    </option>
                  }
                </select>
                @if (medF.invalid && medF.touched) { <span class="campo__error">Seleccione un medico</span> }
              }
            </div>

            <div class="campo">
              <label class="campo__etiqueta">Motivo de Ingreso:</label>
              <input type="text" class="campo__input" name="motivo"
                [(ngModel)]="orden.motivo" maxlength="500" placeholder="Describa el motivo de la emergencia" />
            </div>

            <div class="grupo-botones">
              <button type="submit" class="btn btn--primario"
                [disabled]="cargando() || ordenForm.invalid || !orden.medicoId || !orden.historiaClinicaId">
                @if (cargando()) { <span class="spinner"></span> } Registrar Orden de Emergencia
              </button>
              <button type="button" class="btn btn--contorno" [disabled]="!ordenGenerada()">
                Imprimir Orden
              </button>
            </div>
          </form>
        </div>

        @if (ordenGenerada()) {
          <div class="resultado resultado--orden">
            <div class="resultado__cabecera">
              <span class="etiqueta etiqueta--orden">Orden Generada</span>
              <code class="resultado__num">{{ ordenGenerada()!.numeroOrden }}</code>
            </div>
            <div class="resultado__grid">
              <div class="resultado__campo"><span class="resultado__clave">Paciente</span><span class="resultado__valor">{{ ordenGenerada()!.nombrePaciente }}</span></div>
              <div class="resultado__campo"><span class="resultado__clave">Medico</span><span class="resultado__valor">{{ ordenGenerada()!.nombreMedico }}</span></div>
              <div class="resultado__campo"><span class="resultado__clave">Especialidad</span><span class="resultado__valor">{{ ordenGenerada()!.especialidadMedico }}</span></div>
              <div class="resultado__campo"><span class="resultado__clave">Estado</span><span class="texto-acento">{{ ordenGenerada()!.estado }}</span></div>
            </div>
          </div>
        }

        <div class="bloque">
          <h3 class="bloque__titulo">Ordenes de Emergencia Registradas Hoy</h3>
          @if (ordenesHoy().length === 0) {
            <p class="sin-datos-texto">No hay ordenes en esta sesion.</p>
          } @else {
            <div class="tabla-responsive">
              <table class="tabla">
                <thead><tr><th>Nro Orden</th><th>Paciente</th><th>Medico Asignado</th><th>Estado</th></tr></thead>
                <tbody>
                  @for (o of ordenesHoy(); track o.id) {
                    <tr>
                      <td><code>{{ o.numeroOrden }}</code></td>
                      <td>{{ o.nombrePaciente }}</td>
                      <td>{{ o.nombreMedico }}</td>
                      <td><strong class="texto-acento">{{ o.estado }}</strong></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </section>
    </main>
  `,
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
        this.exitoMensaje.set(`Historia ${resp.numeroHistoria} creada. Continue con la orden de emergencia.`);
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
        this.exitoMensaje.set(`Orden ${o.numeroOrden} asignada a ${o.nombreMedico}.`);
        this.cargando.set(false);
        this.orden = { historiaClinicaId: this.historiaSeleccionada()?.id ?? null, medicoId: null, motivo: '' };
        form.resetForm({ historiaClinicaId: this.orden.historiaClinicaId });
      },
      error: (e: HttpErrorResponse) => {
        this.errorMensaje.set(e.status === 403 ? 'Sin permiso. Se requiere JEFE_ENFERMERIA o ADMINISTRADOR.' : (e.error?.mensaje ?? 'Error al generar la orden.'));
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
    return { dniPaciente: '', nombreCompleto: '', telefono: '', email: '', fechaNacimiento: '', genero: '', direccion: '', desdeAdmision: true };
  }

  private limpiarMensajes(): void {
    this.errorMensaje.set('');
    this.exitoMensaje.set('');
  }
}
