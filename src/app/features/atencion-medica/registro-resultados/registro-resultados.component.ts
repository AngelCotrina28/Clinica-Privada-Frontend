import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../shared/header/header.component';
import { AtencionMedicaService } from '../../../core/services/atencion-medica.service';
import { HistoriaClinicaResponse } from '../../../core/model/historia-clinica.model';

@Component({
  selector: 'app-registro-resultados',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, RouterModule],
  templateUrl: './registro-resultados.component.html',
  styleUrl: './registro-resultados.component.scss'
})
export class RegistroResultadosComponent implements OnInit {

  private atencionService = inject(AtencionMedicaService);

  pacienteActivo: HistoriaClinicaResponse | null = null;

  ngOnInit() {
    this.atencionService.pacienteActivo$.subscribe(paciente => {
      this.pacienteActivo = paciente;
    });
  }

  guardarAtencion() {
    if (this.pacienteActivo) {
      alert(`Simulación: Guardando diagnóstico para ${this.pacienteActivo.nombreCompleto}`);
    }
  }
}