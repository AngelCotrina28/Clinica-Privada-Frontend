import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
export class RegistroResultadosComponent implements OnInit {

  private atencionService = inject(AtencionMedicaService);

  pacienteActivo: HistoriaClinicaResponse | null = null;
  diagnosticoCie10: string = '';
  notasEvolucion: string = '';
  cargando: boolean = false;

  ngOnInit() {
    this.atencionService.pacienteActivo$.subscribe(paciente => {
      this.pacienteActivo = paciente;
    });
  }

  guardarAtencion() {
    if (!this.pacienteActivo) return;
    
    // Validación básica
    if (!this.diagnosticoCie10.trim()) {
      alert('El diagnóstico es obligatorio');
      return;
    }

    this.cargando = true;

    const request: AtencionMedicaRequest = {
      historiaClinicaId: this.pacienteActivo.id,
      numeroCita: 'CE-045',
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
}