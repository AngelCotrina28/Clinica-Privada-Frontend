import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HeaderComponent } from '../../../shared/header/header.component';
import { AbrirHistoriaRequest, HistoriaClinicaResponse } from '../../../core/model/admision.models';
import {
  limpiarDocumentoPaciente,
  maxDocumentoPaciente,
  mensajeDocumentoPaciente,
  patronDocumentoPaciente,
  TipoDocumentoPaciente
} from '../documento-paciente.util';

@Component({
  selector: 'app-admision-historias',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  template: `
    <app-header titulo="Gestion de Historias Clinicas" />
    <main class="contenedor">
      <section>
        <h2 class="subtitulo-seccion">Gestion de Historias Clinicas</h2>

        @if (errorMensaje()) {
          <div class="alerta alerta--error">
            <span>!</span><p>{{ errorMensaje() }}</p>
            <button type="button" (click)="errorMensaje.set('')">x</button>
          </div>
        }
        @if (exitoMensaje()) {
          <div class="alerta alerta--exito">
            <span>OK</span><p>{{ exitoMensaje() }}</p>
            <button type="button" (click)="exitoMensaje.set('')">x</button>
          </div>
        }

        <div class="bloque">
          <h3 class="bloque__titulo">Apertura / Busqueda de Historia Clinica</h3>
          <div class="grupo-acciones">
            <div class="documento-grid">
              <div class="campo">
                <label class="campo__etiqueta" for="tipo_documento_historia">Tipo</label>
                <select
                  id="tipo_documento_historia"
                  class="campo__input campo__select"
                  [ngModel]="tipoDocumentoBusqueda"
                  (ngModelChange)="cambiarTipoDocumentoBusqueda($event)">
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                </select>
              </div>

              <div class="campo">
                <label class="campo__etiqueta" for="dni_paciente">{{ tipoDocumentoBusqueda }} del Paciente</label>
                <input
                  id="dni_paciente"
                  type="text"
                  class="campo__input"
                  [class.campo__input--error]="documentoBusquedaTocado && !!documentoBusquedaError()"
                  [ngModel]="dniBusqueda"
                  (ngModelChange)="actualizarDocumentoBusqueda($event)"
                  [attr.maxlength]="maxDocumento(tipoDocumentoBusqueda)"
                  [attr.pattern]="patronDocumento(tipoDocumentoBusqueda)"
                  (blur)="documentoBusquedaTocado = true"
                  (keydown.enter)="buscarHistoria()"
                  [placeholder]="tipoDocumentoBusqueda === 'DNI' ? 'Ej: 12345678' : 'Ej: CE1234567'"
                  autocomplete="off" />
                @if (documentoBusquedaTocado && documentoBusquedaError()) {
                  <span class="campo__error">{{ documentoBusquedaError() }}</span>
                }
              </div>
            </div>

            <div class="grupo-botones">
              <button class="btn btn--primario" type="button" (click)="buscarHistoria()"
                [disabled]="cargando() || !documentoBusquedaValido()">
                @if (cargando()) { <span class="spinner"></span> } Buscar Historia
              </button>
              <button class="btn btn--contorno" type="button"
                (click)="prepararNuevaHistoria()"
                [disabled]="!puedeAbrirFormularioHistoria()">
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
                  <span class="resultado__clave">Telefono</span>
                  <span class="resultado__valor">{{ historiaEncontrada()!.telefono || '-' }}</span>
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
                  <label class="campo__etiqueta">Tipo <span class="requerido">*</span></label>
                  <select
                    class="campo__input campo__select"
                    name="tipoDocumentoNueva"
                    [ngModel]="tipoDocumentoNueva"
                    (ngModelChange)="cambiarTipoDocumentoNueva($event)">
                    <option value="DNI">DNI</option>
                    <option value="CE">CE</option>
                  </select>
                </div>

                <div class="campo">
                  <label class="campo__etiqueta">{{ tipoDocumentoNueva }} <span class="requerido">*</span></label>
                  <input
                    type="text"
                    class="campo__input"
                    name="dniPaciente"
                    required
                    [minlength]="tipoDocumentoNueva === 'DNI' ? 8 : 1"
                    [maxlength]="maxDocumento(tipoDocumentoNueva)"
                    [pattern]="patronDocumento(tipoDocumentoNueva)"
                    [ngModel]="nuevaHistoria.dniPaciente"
                    (ngModelChange)="actualizarDocumentoNueva($event)"
                    (blur)="documentoNuevaTocado = true"
                    #dniF="ngModel"
                    [class.campo__input--error]="(dniF.invalid && dniF.touched) || (documentoNuevaTocado && !!documentoNuevaError())" />
                  @if ((dniF.invalid && dniF.touched) || (documentoNuevaTocado && documentoNuevaError())) {
                    <span class="campo__error">{{ documentoNuevaError() || 'Documento obligatorio' }}</span>
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
                    <option value="">Seleccionar</option>
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
                  [disabled]="historiaForm.invalid || !!documentoNuevaError() || cargando()">
                  @if (cargando()) { <span class="spinner"></span> } Registrar Historia Clinica
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
  tipoDocumentoBusqueda: TipoDocumentoPaciente = 'DNI';
  tipoDocumentoNueva: TipoDocumentoPaciente = 'DNI';
  documentoBusquedaTocado = false;
  documentoNuevaTocado = false;
  mostrarFormNueva = false;
  historiaEncontrada = signal<HistoriaClinicaResponse | null>(null);
  nuevaHistoria: AbrirHistoriaRequest = this.initHistoria();
  cargando = signal(false);
  errorMensaje = signal('');
  exitoMensaje = signal('');

  constructor(private http: HttpClient) { }

  buscarHistoria(): void {
    this.documentoBusquedaTocado = true;
    this.dniBusqueda = limpiarDocumentoPaciente(this.tipoDocumentoBusqueda, this.dniBusqueda);
    const errorDocumento = this.documentoBusquedaError();
    if (errorDocumento) {
      this.errorMensaje.set(errorDocumento);
      return;
    }

    this.limpiar();
    this.cargando.set(true);
    this.http.get<HistoriaClinicaResponse>(
      `${this.API}/admision/historia?dni=${encodeURIComponent(this.dniBusqueda.trim())}`
    ).subscribe({
      next: h => {
        this.historiaEncontrada.set(h);
        this.cargando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 404) {
          this.tipoDocumentoNueva = this.tipoDocumentoBusqueda;
          this.mostrarFormNueva = true;
          this.documentoNuevaTocado = false;
          this.nuevaHistoria = { ...this.initHistoria(), dniPaciente: this.dniBusqueda.trim() };
        } else {
          this.errorMensaje.set(e.error?.mensaje ?? 'Error al buscar.');
        }
        this.cargando.set(false);
      }
    });
  }

  abrirNuevaHistoria(form: NgForm): void {
    this.documentoNuevaTocado = true;
    this.nuevaHistoria.dniPaciente = limpiarDocumentoPaciente(this.tipoDocumentoNueva, this.nuevaHistoria.dniPaciente);
    const errorDocumento = this.documentoNuevaError();
    if (form.invalid || errorDocumento) {
      if (errorDocumento) this.errorMensaje.set(errorDocumento);
      return;
    }

    this.limpiar();
    this.cargando.set(true);
    this.nuevaHistoria.desdeAdmision = true;
    this.http.post<HistoriaClinicaResponse>(`${this.API}/admision/historia`, this.nuevaHistoria).subscribe({
      next: resp => {
        this.historiaEncontrada.set(resp);
        this.mostrarFormNueva = false;
        this.cargando.set(false);
        this.dniBusqueda = resp.dniPaciente;
        this.nuevaHistoria = this.initHistoria();
        this.documentoNuevaTocado = false;
        this.exitoMensaje.set(`Historia ${resp.numeroHistoria} creada.`);
      },
      error: (e: HttpErrorResponse) => {
        this.errorMensaje.set(e.error?.mensaje ?? 'Error al crear.');
        this.cargando.set(false);
      }
    });
  }

  prepararNuevaHistoria(): void {
    this.limpiar();

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
  }

  cancelarNueva(): void {
    this.mostrarFormNueva = false;
    this.nuevaHistoria = this.initHistoria();
    this.documentoNuevaTocado = false;
    this.limpiar();
  }

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
    return !this.cargando() && (!this.dniBusqueda.trim() || this.documentoBusquedaValido());
  }

  maxDocumento(tipo: TipoDocumentoPaciente): number {
    return maxDocumentoPaciente(tipo);
  }

  patronDocumento(tipo: TipoDocumentoPaciente): string {
    return patronDocumentoPaciente(tipo);
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

  private limpiar(): void {
    this.errorMensaje.set('');
    this.exitoMensaje.set('');
    this.historiaEncontrada.set(null);
  }
}
