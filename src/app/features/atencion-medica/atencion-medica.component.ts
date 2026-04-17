import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';

interface ItemReceta {
  medicamento: string;
  indicaciones: string;
}

@Component({
  selector: 'app-atencion-medica',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './atencion-medica.component.html',
  styleUrl: './atencion-medica.component.scss'
})
export class AtencionMedicaComponent {

  receta: ItemReceta[] = [
    {
      medicamento:  'Paracetamol 500mg',
      indicaciones: '1 tableta cada 8 horas por 3 días'
    }
  ];

  medicamentosDisponibles = [
    'Paracetamol 500mg',
    'Ibuprofeno 400mg',
    'Amoxicilina 500mg'
  ];
}