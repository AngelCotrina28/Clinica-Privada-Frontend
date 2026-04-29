import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrabajadorService } from '../../../core/services/trabajador.service';
import { Trabajador } from '../../../core/model/trabajador.model';

@Component({
  selector: 'app-catalogo-medicos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalogo-medicos.component.html',
  styleUrls: ['./catalogo-medicos.component.scss']
})
export class CatalogoMedicosComponent implements OnInit {
  medicos: Trabajador[] = [];

  constructor(private trabajadorService: TrabajadorService) {}

  ngOnInit(): void {
    this.cargarCatalogo();
  }

  cargarCatalogo(): void {
    // Usamos el servicio de trabajadores para traer solo médicos
    this.trabajadorService.getMedicosActivos().subscribe({
      next: (data) => this.medicos = data,
      error: (err) => console.error('Error al cargar catálogo', err)
    });
  }
}