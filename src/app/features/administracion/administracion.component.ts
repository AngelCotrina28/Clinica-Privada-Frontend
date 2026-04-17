import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';

interface Cajero {
  id:      string;
  nombre:  string;
  usuario: string;
  estado:  string;
}

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './administracion.component.html',
  styleUrl: './administracion.component.scss'
})
export class AdministracionComponent {

  puntosDeVenta = [
    { value: 'caja_principal',  label: 'Caja Principal - Piso 1' },
    { value: 'caja_emergencia', label: 'Caja Emergencia'         }
  ];

  cajeros: Cajero[] = [
    { id: 'CAJ-01', nombre: 'Jorge Ramírez', usuario: 'jramirez', estado: 'Activo' }
  ];
}