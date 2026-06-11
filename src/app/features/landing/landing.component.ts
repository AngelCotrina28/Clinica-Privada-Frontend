import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // <-- 1. Importamos la herramienta de navegación

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink], // <-- 2. La inyectamos en el componente
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {

}