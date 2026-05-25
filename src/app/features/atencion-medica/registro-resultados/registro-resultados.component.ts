import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { AtencionMedicaService } from '../../../core/services/atencion-medica.service';
import { AtencionMedicaRequest } from '../../../core/model/atencion-medica.model';
import { HistoriaClinicaResponse } from '../../../core/model/historia-clinica.model';

@Component({
  selector: 'app-registro-resultados',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro-resultados.component.html',
  styleUrl: './registro-resultados.component.scss'
})
export class RegistroResultadosComponent implements OnInit, OnDestroy {

  private atencionService = inject(AtencionMedicaService);

  pacienteActivo: HistoriaClinicaResponse | null = null;
  
  numeroCita: string = '';
  estadoCita: string = '';
  verificandoCita: boolean = false;
  
  diagnosticoCie10: string = '';
  notasEvolucion: string = '';
  cargando: boolean = false;

  private citaSubject = new Subject<string>();
  private citaSubscription!: Subscription;

  ngOnInit() {
    this.atencionService.pacienteActivo$.subscribe(paciente => {
      this.pacienteActivo = paciente;
    });

    this.citaSubscription = this.citaSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(termino => {
        const codigoLimpio = termino.trim();
        
        if (!codigoLimpio) {
          this.estadoCita = '';
          this.verificandoCita = false;
          return of(null);
        }
        
        this.verificandoCita = true;
        
        return this.atencionService.verificarExistenciaCita(codigoLimpio).pipe(
          catchError(() => of({ estado: 'ERROR' }))
        );
      })
    ).subscribe((res: {estado: string} | null) => {
      this.verificandoCita = false;
      if (res) {
        this.estadoCita = res.estado;
      }
    });
  }

  onCitaChange(valor: string) {
    this.estadoCita = '';
    this.citaSubject.next(valor);
  }

 guardarAtencion() {
    if (!this.pacienteActivo) return;
    
    if (this.estadoCita !== 'VALIDA') {
      alert('Debe ingresar un código válido y disponible.');
      return;
    }

    if (!this.diagnosticoCie10.trim()) {
      alert('El diagnóstico es obligatorio');
      return;
    }

    this.cargando = true;

    const request: AtencionMedicaRequest = {
      historiaClinicaId: this.pacienteActivo.id,
      numeroCita: this.numeroCita, 
      diagnosticoPrincipal: this.diagnosticoCie10,
      notasEvolucion: this.notasEvolucion,
      medicoId: 6
    };

    this.atencionService.registrarAtencion(request).subscribe({
      next: (idGenerado: number) => {
        alert('¡Atención guardada con éxito en la base de datos! ID: ' + idGenerado);
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al guardar:', err);
        alert('Ocurrió un error al guardar la atención.');
        this.cargando = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.citaSubscription) {
      this.citaSubscription.unsubscribe();
    }
  }
  
}