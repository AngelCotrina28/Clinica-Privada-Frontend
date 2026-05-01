import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HeaderComponent } from '../../../shared/header/header.component';
import { MedicoDisponible, GenerarOrdenRequest, OrdenEmergenciaResponse } from '../admision.models';
 
@Component({
  selector: 'app-admision-emergencia',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  template: `
    <app-header titulo="Flujo de Emergencia" Trabajador="Recepción Central" />
 
    <main class="contenedor">
      <section>
        <h2 class="subtitulo-seccion">Flujo de Emergencia</h2>
 
        @if (errorMensaje()) {
          <div class="alerta alerta--error"><span>⚠</span><p>{{ errorMensaje() }}</p><button (click)="errorMensaje.set('')">✕</button></div>
        }
        @if (exitoMensaje()) {
          <div class="alerta alerta--exito"><span>✓</span><p>{{ exitoMensaje() }}</p><button (click)="exitoMensaje.set('')">✕</button></div>
        }
 
        @if (precargadoId()) {
          <div class="alerta alerta--info">
            <span>ℹ</span>
            <p>Paciente pre-cargado: <strong>{{ precargadoNombre() }}</strong> · Historia: <strong>{{ precargadoNum() }}</strong></p>
          </div>
        }
 
        <div class="bloque">
          <h3 class="bloque__titulo">Generar Orden de Atención de Emergencia</h3>
 
          <form #ordenForm="ngForm" (ngSubmit)="generarOrden(ordenForm)" novalidate>
            <div class="campo">
              <label class="campo__etiqueta">N° Historia Clínica: <span class="requerido">*</span></label>
              <input type="number" class="campo__input" name="historiaClinicaId"
                [(ngModel)]="orden.historiaClinicaId" required min="1"
                #hcF="ngModel" [class.campo__input--error]="hcF.invalid && hcF.touched"
                placeholder="ID numérico de la historia clínica" />
              @if (hcF.invalid && hcF.touched) { <span class="campo__error">ID de historia obligatorio</span> }
            </div>
 
            <div class="campo">
              <label class="campo__etiqueta">Asignar Médico (Disponibles): <span class="requerido">*</span></label>
              @if (cargandoMedicos()) {
                <div class="cargando-inline"><span class="spinner spinner--teal"></span> Cargando médicos...</div>
              }
              @if (!cargandoMedicos() && medicos().length === 0) {
                <div class="sin-datos">
                  <span>Sin médicos cargados.</span>
                  <button type="button" class="btn btn--sm btn--contorno" (click)="cargarMedicos()">Cargar</button>
                </div>
              }
              @if (medicos().length > 0) {
                <select class="campo__input campo__select" name="medicoId"
                  [(ngModel)]="orden.medicoId" required #medF="ngModel"
                  [class.campo__input--error]="medF.invalid && medF.touched">
                  <option [ngValue]="null" disabled>— Seleccionar médico —</option>
                  @for (m of medicos(); track m.id) {
                    <option [ngValue]="m.id">
                      Dr/a. {{ m.nombreCompleto }}
                      {{ m.especialidades.length ? '(' + m.especialidades.join(', ') + ')' : '(Medicina General)' }}
                    </option>
                  }
                </select>
                @if (medF.invalid && medF.touched) { <span class="campo__error">Seleccione un médico</span> }
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
              <div class="resultado__campo"><span class="resultado__clave">Médico</span><span class="resultado__valor">{{ ordenGenerada()!.nombreMedico }}</span></div>
              <div class="resultado__campo"><span class="resultado__clave">Especialidad</span><span class="resultado__valor">{{ ordenGenerada()!.especialidadMedico }}</span></div>
              <div class="resultado__campo"><span class="resultado__clave">Estado</span><span class="texto-acento">{{ ordenGenerada()!.estado }}</span></div>
            </div>
          </div>
        }
 
        <div class="bloque">
          <h3 class="bloque__titulo">Órdenes de Emergencia Registradas Hoy</h3>
          @if (ordenesHoy().length === 0) {
            <p class="sin-datos-texto">No hay órdenes en esta sesión.</p>
          } @else {
            <div class="tabla-responsive">
              <table class="tabla">
                <thead><tr><th>N° Orden</th><th>Paciente</th><th>Médico Asignado</th><th>Estado</th></tr></thead>
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
 
  medicos      = signal<MedicoDisponible[]>([]);
  ordenesHoy   = signal<OrdenEmergenciaResponse[]>([]);
  ordenGenerada = signal<OrdenEmergenciaResponse | null>(null);
  orden: GenerarOrdenRequest = { historiaClinicaId: null, medicoId: null, motivo: '' };
 
  cargando       = signal(false);
  cargandoMedicos = signal(false);
  errorMensaje   = signal('');
  exitoMensaje   = signal('');
 
  precargadoId     = signal<number | null>(null);
  precargadoNum    = signal('');
  precargadoNombre = signal('');
 
  constructor(private http: HttpClient, private route: ActivatedRoute) {}
 
  ngOnInit(): void {
    this.cargarMedicos();
    this.route.queryParams.subscribe(p => {
      if (p['historiaId']) {
        this.precargadoId.set(+p['historiaId']);
        this.precargadoNum.set(p['numeroHistoria'] ?? '');
        this.precargadoNombre.set(p['nombre'] ?? '');
        this.orden.historiaClinicaId = +p['historiaId'];
      }
    });
  }
 
  cargarMedicos(): void {
    this.cargandoMedicos.set(true);
    this.http.get<MedicoDisponible[]>(`${this.API}/trabajadores/medicos/activos`).subscribe({
      next:  list => { this.medicos.set(list); this.cargandoMedicos.set(false); },
      error: ()   => { this.errorMensaje.set('No se pudieron cargar los médicos.'); this.cargandoMedicos.set(false); }
    });
  }
 
  generarOrden(form: NgForm): void {
    if (form.invalid || !this.orden.medicoId || !this.orden.historiaClinicaId) return;
    this.errorMensaje.set(''); this.exitoMensaje.set(''); this.cargando.set(true);
    this.http.post<OrdenEmergenciaResponse>(`${this.API}/admision/emergencia/orden`, this.orden).subscribe({
      next: o => {
        this.ordenGenerada.set(o); this.ordenesHoy.update(l => [o, ...l]);
        this.exitoMensaje.set(`Orden ${o.numeroOrden} asignada a ${o.nombreMedico}.`);
        this.cargando.set(false); this.orden = { historiaClinicaId: null, medicoId: null, motivo: '' }; form.resetForm();
      },
      error: (e: HttpErrorResponse) => {
        this.errorMensaje.set(e.status === 403 ? 'Sin permiso. Se requiere JEFE_ENFERMERIA o ADMINISTRADOR.' : (e.error?.mensaje ?? 'Error al generar la orden.'));
        this.cargando.set(false);
      }
    });
  }
}