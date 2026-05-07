import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { AtencionMedicaService } from '../../core/services/atencion-medica.service';
import { HistoriaClinicaResponse } from '../../core/model/historia-clinica.model';

@Component({
  selector: 'app-atencion-medica',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './atencion-medica.component.html',
  styleUrl: './atencion-medica.component.scss'
})
export class AtencionMedicaComponent implements OnInit {
  private atencionService = inject(AtencionMedicaService);
  private router = inject(Router);

  pacienteActivo: HistoriaClinicaResponse | null = null;

  ngOnInit() {
    this.atencionService.pacienteActivo$.subscribe(p => this.pacienteActivo = p);
  }

  finalizarAtencion() {
    if (confirm('¿Desea cerrar la sesión del paciente actual?')) {
      // Limpia la memoria y fuerza la redirección al buscador
      this.atencionService.setPacienteActivo(null);
      this.router.navigate(['/atencion-medica/historial-clinico']);
    }
  }
}