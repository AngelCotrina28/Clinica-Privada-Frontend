import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
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
export class AtencionMedicaComponent implements OnInit, OnDestroy {
  private atencionService = inject(AtencionMedicaService);
  private router = inject(Router);
  
  // Variable para almacenar y gestionar la suscripción
  private pacienteSubscription!: Subscription;

  pacienteActivo: HistoriaClinicaResponse | null = null;

  ngOnInit() {
    this.pacienteSubscription = this.atencionService.pacienteActivo$.subscribe(
      p => this.pacienteActivo = p
    );
  }

  finalizarAtencion() {
    if (confirm('¿Desea cerrar la sesión del paciente actual?')) {
      // Limpia la memoria del paciente activo
      this.atencionService.setPacienteActivo(null);

      this.router.navigate(['/atencion-medica/buscar']);
    }
  }

  ngOnDestroy() {
    // Se cancela la suscripción al destruir el componente para liberar memoria
    if (this.pacienteSubscription) {
      this.pacienteSubscription.unsubscribe();
    }
  }
}