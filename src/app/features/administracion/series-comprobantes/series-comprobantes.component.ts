import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-series-comprobantes',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './series-comprobantes.component.html',
  styleUrl: './series-comprobantes.component.scss'
})
export class SeriesComprobantesComponent {
  constructor() {}
}
