import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  // Cada feature le pasa su propio título y Trabajador al header.
  // Ejemplo en el template del feature:
  //   <app-header titulo="Módulo de Admisión" Trabajador="Recepción Central" />
  @Input() titulo: string = 'Resumen Operativo';
  @Input() Trabajador: string = 'Trabajador del Sistema';
}