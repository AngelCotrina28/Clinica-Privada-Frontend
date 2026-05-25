import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-asignacion-cajas',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './asignacion-cajas.component.html',
  styleUrl: './asignacion-cajas.component.scss'
})
export class AsignacionCajasComponent {
  constructor() {}
}
