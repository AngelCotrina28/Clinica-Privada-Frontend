import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';

interface OrdenEmergencia {
  nroOrden:       string;
  paciente:       string;
  medicoAsignado: string;
  estado:         string;
}

@Component({
  selector: 'app-admision',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './admision.component.html',
  styleUrl: './admision.component.scss'
})
export class AdmisionComponent {

  ordenes: OrdenEmergencia[] = [
    {
      nroOrden:       'EM-001',
      paciente:       'Luis Pérez',
      medicoAsignado: 'Dr. Carlos Mendoza',
      estado:         'En Atención'
    }
  ];

  medicos = [
    { value: 'med_1', label: 'Dr. Carlos Mendoza (Medicina General)' },
    { value: 'med_2', label: 'Dra. Ana Silva (Traumatología)'        }
  ];

  especialidades = [
    { value: 'cardiologia',       label: 'Cardiología'       },
    { value: 'pediatria',         label: 'Pediatría'         },
    { value: 'gastroenterologia', label: 'Gastroenterología' }
  ];
}