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
  
  // Nuevas variables para el control de la Cita
  numeroCita: string = '';
  citaValida: boolean = false;
  verificandoCita: boolean = false;
  
  diagnosticoCie10: string = '';
  notasEvolucion: string = '';
  cargando: boolean = false;

  // Subject para manejar la entrada de texto con retraso
  private citaSubject = new Subject<string>();
  private citaSubscription!: Subscription;

  ngOnInit() {
    this.atencionService.pacienteActivo$.subscribe(paciente => {
      this.pacienteActivo = paciente;
    });

    // Configuración del validador asíncrono
    this.citaSubscription = this.citaSubject.pipe(
      debounceTime(500), // Espera 500ms tras la última tecla pulsada
      distinctUntilChanged(), // Solo busca si el valor ha cambiado
      switchMap(termino => {
        const codigoLimpio = termino.trim(); // Limpiamos espacios en blanco
        
        if (!codigoLimpio) {
          this.citaValida = false;
          this.verificandoCita = false;
          return of(null);
        }
        
        this.verificandoCita = true;
        
        // Enviamos el código alfanumérico al servicio
        return this.atencionService.verificarExistenciaCita(codigoLimpio).pipe(
          catchError(() => of(false))
        );
      })
    ).subscribe((existe: boolean | null) => {
      this.verificandoCita = false;
      if (existe !== null) {
        this.citaValida = existe;
      }
    });
  }

  // Método que se activa cada vez que el usuario teclea en el input
  onCitaChange(valor: string) {
    this.citaValida = false; // Se invalida temporalmente mientras escribe
    this.citaSubject.next(valor);
  }

  guardarAtencion() {
    if (!this.pacienteActivo) return;
    
    // Validación de que la cita exista antes de guardar
    if (!this.citaValida) {
      alert('Debe ingresar un N° de Cita / Orden válido.');
      return;
    }

    if (!this.diagnosticoCie10.trim()) {
      alert('El diagnóstico es obligatorio');
      return;
    }

    this.cargando = true;

    const request: AtencionMedicaRequest = {
      historiaClinicaId: this.pacienteActivo.id,
      numeroCita: this.numeroCita, // Se reemplaza el valor estático 'CE-045'
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
    // Evita fugas de memoria al destruir el componente
    if (this.citaSubscription) {
      this.citaSubscription.unsubscribe();
    }
  }
}