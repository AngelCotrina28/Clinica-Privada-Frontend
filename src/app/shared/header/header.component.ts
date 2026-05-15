import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
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
  @Input() Trabajador: string = 'Trabajador del Sistema';
}