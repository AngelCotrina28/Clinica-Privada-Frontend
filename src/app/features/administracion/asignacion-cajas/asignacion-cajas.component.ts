import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asignacion-cajas',
  standalone: true,
  imports: [CommonModule], // Ya no necesitamos RouterLink aquí
  templateUrl: './asignacion-cajas.component.html',
  styleUrl: './asignacion-cajas.component.scss'
})
export class AsignacionCajasComponent {
  constructor() {}
}