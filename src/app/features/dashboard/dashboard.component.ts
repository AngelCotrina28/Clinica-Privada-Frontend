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
      titulo: 'Pacientes en Emergencia',
      descripcion: 'Indicador pendiente de conectar.',
      valor: '-',
      sufijo: ''
    },
    {
      titulo: 'Citas del Dia',
      descripcion: 'Indicador pendiente de conectar.',
      valor: '-',
      sufijo: ''
    },
    {
      titulo: 'Estado de Caja',
      descripcion: 'Indicador pendiente de conectar.',
      valor: '-',
      sufijo: ''
    }
  ];
}
