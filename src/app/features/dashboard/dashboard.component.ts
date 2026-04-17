import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  resumen = [
    {
      titulo:      'Pacientes en Emergencia',
      descripcion: 'Actualmente hay',
      valor:       '12',
      sufijo:      'pacientes registrados en triaje.'
    },
    {
      titulo:      'Citas del Día',
      descripcion: 'Hay',
      valor:       '45',
      sufijo:      'citas programadas para hoy en Consulta Externa.'
    },
    {
      titulo:      'Estado de Caja',
      descripcion: 'Caja Principal:',
      valor:       'Abierta',
      sufijo:      ''
    }
  ];
}