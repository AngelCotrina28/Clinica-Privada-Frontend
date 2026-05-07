import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../shared/header/header.component';
import { AtencionMedicaService } from '../../../core/services/atencion-medica.service';
import { HistoriaClinicaResponse } from '../../../core/model/historia-clinica.model';

interface ItemReceta {
  medicamento: string;
  indicaciones: string;
}

@Component({
  selector: 'app-receta-medica',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, RouterModule],
  templateUrl: './receta-medica.component.html',
  styleUrl: './receta-medica.component.scss'
})
export class RecetaMedicaComponent implements OnInit {

  private atencionService = inject(AtencionMedicaService);

  pacienteActivo: HistoriaClinicaResponse | null = null;

  // Datos extraídos de tu componente original
  receta: ItemReceta[] = [
    {
      medicamento: 'Paracetamol 500mg',
      indicaciones: '1 tableta cada 8 horas por 3 días'
    }
  ];

  medicamentosDisponibles = [
    'Paracetamol 500mg',
    'Ibuprofeno 400mg',
    'Amoxicilina 500mg'
  ];

  ngOnInit() {
    this.atencionService.pacienteActivo$.subscribe(paciente => {
      this.pacienteActivo = paciente;
    });
  }
}