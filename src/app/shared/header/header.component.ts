import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
<<<<<<< HEAD
  template: `
    <header class="header-top">
      <h1>{{ titulo }}</h1>
      <p>Trabajador: {{ usuario || Trabajador }}</p>
    </header>
  `,
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  @Input() titulo: string     = 'Resumen Operativo';
  /** Alias moderno — usa este en componentes nuevos */
  @Input() usuario: string    = '';
  /** Alias legado — mantiene compatibilidad con los existentes */
=======
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  // Cada feature le pasa su propio título y Trabajador al header.
  // Ejemplo en el template del feature:
  //   <app-header titulo="Módulo de Admisión" Trabajador="Recepción Central" />
  @Input() titulo: string = 'Resumen Operativo';
>>>>>>> 493cebeb0b0735ed9444b44c5ee4385f742d73a5
  @Input() Trabajador: string = 'Trabajador del Sistema';
}