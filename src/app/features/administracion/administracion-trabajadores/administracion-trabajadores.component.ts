import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrabajadorService } from '../../../core/services/trabajador.service';
import { Trabajador } from '../../../core/model/trabajador.model';

@Component({
  selector: 'app-administracion-trabajadores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './administracion-trabajadores.component.html',
  styleUrl: './administracion-trabajadores.component.scss'
})
export class AdministracionTrabajadoresComponent implements OnInit {
  
  listaTrabajadores: Trabajador[] = [];
  isModalOpen: boolean = false;

  constructor(private trabajadorService: TrabajadorService) {}

  ngOnInit(): void {
    this.cargarTrabajadores();
  }

  cargarTrabajadores(): void {
    this.trabajadorService.listarTodos().subscribe({
      next: (data) => {
        this.listaTrabajadores = data;
        console.log('Datos recibidos del backend:', data);
      },
      error: (err) => {
        console.error('Error al conectar con Spring Boot:', err);
      }
    });
  }

  abrirModal(): void { this.isModalOpen = true; }
  cerrarModal(): void { this.isModalOpen = false; }
}