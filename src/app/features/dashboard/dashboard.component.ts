import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  resumen = [
    {
      titulo: 'Pacientes en Emergencia',
      descripcion: 'Ordenes pendientes o en atencion hoy.',
      valor: '-',
      sufijo: ''
    },
    {
      titulo: 'Citas del Dia',
      descripcion: 'Citas programadas o confirmadas hoy.',
      valor: '-',
      sufijo: ''
    },
    {
      titulo: 'Estado de Caja',
      descripcion: 'Sin datos de caja cargados.',
      valor: '-',
      sufijo: ''
    }
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.obtenerResumen().subscribe({
      next: resumen => {
        this.resumen = [
          {
            titulo: 'Pacientes en Emergencia',
            descripcion: 'Ordenes pendientes o en atencion hoy.',
            valor: String(resumen.pacientesEmergencia),
            sufijo: resumen.pacientesEmergencia === 1 ? 'paciente' : 'pacientes'
          },
          {
            titulo: 'Citas del Dia',
            descripcion: 'Citas programadas o confirmadas hoy.',
            valor: String(resumen.citasDia),
            sufijo: resumen.citasDia === 1 ? 'cita' : 'citas'
          },
          {
            titulo: 'Estado de Caja',
            descripcion: resumen.estadoCajaDetalle || 'Estado operativo de la caja.',
            valor: this.formatearEstadoCaja(resumen.estadoCaja),
            sufijo: ''
          }
        ];
      },
      error: () => {
        this.resumen = this.resumen.map(card => ({
          ...card,
          valor: '!',
          descripcion: 'No se pudo cargar el indicador.'
        }));
      }
    });
  }

  private formatearEstadoCaja(estado: string): string {
    return estado
      .toLowerCase()
      .split('_')
      .map(parte => parte.charAt(0).toUpperCase() + parte.slice(1))
      .join(' ');
  }
}
