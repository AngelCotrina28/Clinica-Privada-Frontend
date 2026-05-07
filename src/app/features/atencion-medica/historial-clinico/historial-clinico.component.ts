import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/header/header.component';
import { HistoriaClinicaService } from '../../../core/services/historia-clinica.service';
import { AtencionMedicaService } from '../../../core/services/atencion-medica.service';
import { HistoriaClinicaResponse } from '../../../core/model/historia-clinica.model';
import { AtencionMedicaHistorial } from '../../../core/model/atencion-medica.model';

@Component({
  selector: 'app-historial-clinico',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './historial-clinico.component.html',
  styleUrl: './historial-clinico.component.scss'
})
export class HistorialClinicoComponent {
  private historiaService = inject(HistoriaClinicaService);
  private atencionService = inject(AtencionMedicaService);

  tipoBusqueda: 'DNI' | 'NUMERO' = 'DNI';
  terminoBusqueda: string = '';
  pacienteEncontrado: HistoriaClinicaResponse | null = null;
  mensajeBusqueda: string = '';
  cargandoBusqueda: boolean = false;

  historialMedico: AtencionMedicaHistorial[] = [];
  cargandoHistorial: boolean = false;

  buscarPaciente() {
    if (!this.terminoBusqueda.trim()) {
      this.mensajeBusqueda = 'Por favor, ingrese un valor para buscar.';
      return;
    }

    this.cargandoBusqueda = true;
    this.mensajeBusqueda = '';
    this.pacienteEncontrado = null;
    this.historialMedico = [];

    const peticion = this.tipoBusqueda === 'DNI'
      ? this.historiaService.buscarPorDni(this.terminoBusqueda)
      : this.historiaService.buscarPorNumeroHistoria(this.terminoBusqueda);

    peticion.subscribe({
      next: (paciente) => {
        this.pacienteEncontrado = paciente;
        this.cargandoBusqueda = false;
        this.cargarHistorialAnterior(paciente.id);
        this.atencionService.setPacienteActivo(paciente);
      },
      error: (err) => {
        this.cargandoBusqueda = false;
        this.mensajeBusqueda = err.error?.mensaje || 'No se encontró la historia clínica.';
      }
    });
  }

  cargarHistorialAnterior(historiaId: number) {
    this.cargandoHistorial = true;
    this.atencionService.obtenerHistorialPaciente(historiaId).subscribe({
      next: (historial) => {
        this.historialMedico = historial;
        this.cargandoHistorial = false;
      },
      error: (err) => {
        console.error('Error al cargar el historial médico', err);
        this.cargandoHistorial = false;
      }
    });
  }
}