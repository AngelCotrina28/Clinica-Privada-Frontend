import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HeaderComponent } from '../../../shared/header/header.component';
import { AbrirHistoriaRequest, HistoriaClinicaResponse } from '../admision.models';

@Component({
  selector: 'app-admision-historias',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  template: `
    <app-header titulo="Gestión de Historias Clínicas" Trabajador="Recepción Central" />
    <main class="contenedor">
      <section>
        <h2 class="subtitulo-seccion">Gestión de Historias Clínicas</h2>
 
        @if (errorMensaje()) {
          <div class="alerta alerta--error">
            <span>⚠</span><p>{{ errorMensaje() }}</p>
            <button (click)="errorMensaje.set('')">✕</button>
          </div>
        }
        @if (exitoMensaje()) {
          <div class="alerta alerta--exito">
            <span>✓</span><p>{{ exitoMensaje() }}</p>
            <button (click)="exitoMensaje.set('')">✕</button>
          </div>
        }
 
        <div class="bloque">
          <h3 class="bloque__titulo">Apertura / Búsqueda de Historia Clínica</h3>
          <div class="grupo-acciones">
            <label class="campo__etiqueta" for="dni_paciente">DNI / CE del Paciente:</label>
            <input id="dni_paciente" type="text" class="campo__input"
              [(ngModel)]="dniBusqueda" placeholder="Ej: 12345678"
              maxlength="12" (keydown.enter)="buscarHistoria()" autocomplete="off" />
            <div class="grupo-botones">
              <button class="btn btn--primario" (click)="buscarHistoria()"
                [disabled]="cargando() || !dniBusqueda.trim()">
                @if (cargando()) { <span class="spinner"></span> } Buscar Historia
              </button>
              <button class="btn btn--contorno"
                (click)="mostrarFormNueva = true; nuevaHistoria.dniPaciente = dniBusqueda">
                Abrir Nueva Historia
              </button>
            </div>
          </div>
 
          @if (historiaEncontrada()) {
            <div class="resultado resultado--encontrado">
              <div class="resultado__cabecera">
                <span class="etiqueta etiqueta--encontrada">Encontrada</span>
                <code class="resultado__num">{{ historiaEncontrada()!.numeroHistoria }}</code>
              </div>
              <div class="resultado__grid">
                <div class="resultado__campo">
                  <span class="resultado__clave">Paciente</span>
                  <span class="resultado__valor">{{ historiaEncontrada()!.nombreCompleto }}</span>
                </div>
                <div class="resultado__campo">
                  <span class="resultado__clave">DNI / CE</span>
                  <span class="resultado__valor">{{ historiaEncontrada()!.dniPaciente }}</span>
                </div>
                <div class="resultado__campo">
                  <span class="resultado__clave">Teléfono</span>
                  <span class="resultado__valor">{{ historiaEncontrada()!.telefono || '—' }}</span>
                </div>
                <div class="resultado__campo">
                  <span class="resultado__clave">Registrado por</span>
                  <span class="resultado__valor">{{ historiaEncontrada()!.creadoPor }}</span>
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
                    <span class="campo__error">DNI obligatorio (mín. 8 caracteres)</span>
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
                  <label class="campo__etiqueta">Teléfono</label>
                  <input type="tel" class="campo__input" name="telefono"
                    [(ngModel)]="nuevaHistoria.telefono" maxlength="15" placeholder="987 654 321" />
                </div>
                <div class="campo">
                  <label class="campo__etiqueta">Email</label>
                  <input type="email" class="campo__input" name="email"
                    [(ngModel)]="nuevaHistoria.email" #emailF="ngModel"
                    [class.campo__input--error]="emailF.invalid && emailF.touched" />
                  @if (emailF.invalid && emailF.touched) {
                    <span class="campo__error">Formato de email inválido</span>
                  }
                </div>
                <div class="campo">
                  <label class="campo__etiqueta">Fecha de Nacimiento</label>
                  <input type="date" class="campo__input" name="fechaNacimiento"
                    [(ngModel)]="nuevaHistoria.fechaNacimiento" />
                </div>
                <div class="campo">
                  <label class="campo__etiqueta">Género</label>
                  <select class="campo__input campo__select" name="genero" [(ngModel)]="nuevaHistoria.genero">
                    <option value="">— Seleccionar —</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
                <div class="campo campo--full">
                  <label class="campo__etiqueta">Dirección</label>
                  <input type="text" class="campo__input" name="direccion"
                    [(ngModel)]="nuevaHistoria.direccion" placeholder="Av. Ejemplo 123, Lima" />
                </div>
              </div>
              <div class="grupo-botones grupo-botones--form">
                <button type="submit" class="btn btn--primario"
                  [disabled]="historiaForm.invalid || cargando()">
                  @if (cargando()) { <span class="spinner"></span> } Registrar Historia Clínica
                </button>
                <button type="button" class="btn btn--ghost" (click)="cancelarNueva()">Cancelar</button>
              </div>
            </form>
          </div>
        }
 
      </section>
    </main>
  `,
  styleUrl: '../admision.component.scss'
})
export class AdmisionHistoriasComponent {
  private readonly API = 'http://localhost:8080/api';

  dniBusqueda = '';
  mostrarFormNueva = false;
  historiaEncontrada = signal<HistoriaClinicaResponse | null>(null);
  nuevaHistoria: AbrirHistoriaRequest = this.initHistoria();
  cargando = signal(false);
  errorMensaje = signal('');
  exitoMensaje = signal('');

  constructor(private http: HttpClient) { }

  buscarHistoria(): void {
    if (!this.dniBusqueda.trim()) return;
    this.limpiar(); this.cargando.set(true);
    this.http.get<HistoriaClinicaResponse>(
      `${this.API}/admision/historia?dni=${encodeURIComponent(this.dniBusqueda.trim())}`
    ).subscribe({
      next: h => { this.historiaEncontrada.set(h); this.cargando.set(false); },
      error: (e: HttpErrorResponse) => {
        if (e.status === 404) { this.mostrarFormNueva = true; this.nuevaHistoria.dniPaciente = this.dniBusqueda.trim(); }
        else this.errorMensaje.set(e.error?.mensaje ?? 'Error al buscar.');
        this.cargando.set(false);
      }
    });
  }

  abrirNuevaHistoria(form: NgForm): void {
    if (form.invalid) return;
    this.limpiar(); this.cargando.set(true);
    this.nuevaHistoria.desdeAdmision = true;
    this.http.post<HistoriaClinicaResponse>(`${this.API}/admision/historia`, this.nuevaHistoria).subscribe({
      next: resp => {
        this.historiaEncontrada.set(resp); this.mostrarFormNueva = false; this.cargando.set(false);
        this.dniBusqueda = resp.dniPaciente;
        this.nuevaHistoria = this.initHistoria();
        this.exitoMensaje.set(`Historia ${resp.numeroHistoria} creada.`);
      },
      error: (e: HttpErrorResponse) => { this.errorMensaje.set(e.error?.mensaje ?? 'Error al crear.'); this.cargando.set(false); }
    });
  }

  cancelarNueva(): void { this.mostrarFormNueva = false; this.nuevaHistoria = this.initHistoria(); this.limpiar(); }
  private initHistoria(): AbrirHistoriaRequest {
    return { dniPaciente: '', nombreCompleto: '', telefono: '', email: '', fechaNacimiento: '', genero: '', direccion: '', desdeAdmision: true };
  }
  private limpiar(): void { this.errorMensaje.set(''); this.exitoMensaje.set(''); this.historiaEncontrada.set(null); }
}
