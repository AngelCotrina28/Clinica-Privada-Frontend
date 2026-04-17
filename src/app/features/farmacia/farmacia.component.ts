import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';

interface OrdenDespacho {
  nroReceta:     string;
  paciente:      string;
  origen:        string;
  estadoPago:    string;
}

@Component({
  selector: 'app-farmacia',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './farmacia.component.html',
  styleUrl: './farmacia.component.scss'
})
export class FarmaciaComponent {

  ordenesPendientes: OrdenDespacho[] = [
    {
      nroReceta:  'REC-9921',
      paciente:   'María Gómez',
      origen:     'Consulta Externa',
      estadoPago: 'Pagado'
    }
  ];
}