import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../shared/header/header.component';
import { CitaRequest } from '../admision.models';
 
@Component({
  selector: 'app-admision-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  template: `
    <app-header titulo="Consulta Externa" Trabajador="Recepción Central" />
 
    <main class="contenedor">
      <section>
        <h2 class="subtitulo-seccion">Flujo de Consulta Externa</h2>
 
        @if (exitoMensaje()) {
          <div class="alerta alerta--exito"><span>✓</span><p>{{ exitoMensaje() }}</p><button (click)="exitoMensaje.set('')">✕</button></div>
        }
 
        <div class="bloque">
          <h3 class="bloque__titulo">Programación de Citas Médicas</h3>
 
          <form #citaFormRef="ngForm" (ngSubmit)="programarCita(citaFormRef)" novalidate>
 
            <div class="campo">
              <label class="campo__etiqueta" for="id_historia_cita">N° Historia Clínica: <span class="requerido">*</span></label>
              <input id="id_historia_cita" type="number" class="campo__input" name="historiaClinicaId"
                [(ngModel)]="cita.historiaClinicaId" required min="1"
                #hcF="ngModel" [class.campo__input--error]="hcF.invalid && hcF.touched"
                placeholder="ID numérico de la historia clínica" />
              @if (hcF.invalid && hcF.touched) { <span class="campo__error">ID de historia obligatorio</span> }
            </div>
 
            <div class="campo">
              <label class="campo__etiqueta" for="especialidad">Especialidad: <span class="requerido">*</span></label>
              <select id="especialidad" class="campo__input campo__select" name="especialidadId"
                [(ngModel)]="cita.especialidadId" required
                #espF="ngModel" [class.campo__input--error]="espF.invalid && espF.touched">
                <option [ngValue]="null" disabled>— Seleccionar especialidad —</option>
                @for (esp of especialidades; track esp.value) {
                  <option [ngValue]="esp.value">{{ esp.label }}</option>
                }
              </select>
              @if (espF.invalid && espF.touched) { <span class="campo__error">Seleccione una especialidad</span> }
            </div>
 
            <div class="campo">
              <label class="campo__etiqueta" for="fecha_cita">Fecha y Hora: <span class="requerido">*</span></label>
              <input id="fecha_cita" type="datetime-local" class="campo__input" name="fechaHora"
                [(ngModel)]="cita.fechaHora" required
                #fechaF="ngModel" [class.campo__input--error]="fechaF.invalid && fechaF.touched" />
              @if (fechaF.invalid && fechaF.touched) { <span class="campo__error">Seleccione fecha y hora</span> }
            </div>
 
            <div class="grupo-botones">
              <button type="submit" class="btn btn--primario" [disabled]="citaFormRef.invalid">
                Programar Cita
              </button>
              <button type="button" class="btn btn--contorno">Generar Ticket de Turno</button>
            </div>
 
          </form>
        </div>
      </section>
    </main>
  `,
  styleUrl: '../admision.component.scss'
})
export class AdmisionConsultaComponent implements OnInit {
 
  cita: CitaRequest = { historiaClinicaId: null, especialidadId: null, fechaHora: '' };
  exitoMensaje = signal('');
 
  especialidades = [
    { value: 1, label: 'Cardiología'       },
    { value: 2, label: 'Pediatría'         },
    { value: 3, label: 'Gastroenterología' },
    { value: 4, label: 'Traumatología'     },
    { value: 5, label: 'Medicina General'  },
  ];
 
  constructor(private route: ActivatedRoute) {}
 
  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      if (p['historiaId']) this.cita.historiaClinicaId = +p['historiaId'];
    });
  }
 
  programarCita(form: NgForm): void {
    if (form.invalid) return;
    this.exitoMensaje.set('Cita programada correctamente. (endpoint pendiente)');
    }
}
