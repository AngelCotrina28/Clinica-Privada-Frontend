import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrabajadorService } from '../../../core/services/trabajador.service';
import { Trabajador } from '../../../core/model/trabajador.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-administracion-trabajadores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './administracion-trabajadores.component.html',
  styleUrl: './administracion-trabajadores.component.scss'
})
export class AdministracionTrabajadoresComponent implements OnInit {
  
  isEditMode: boolean = false;
  idSeleccionado: number | null = null;
  trabajadorForm: FormGroup;
  listaTrabajadores: Trabajador[] = [];
  isModalOpen: boolean = false;

  constructor(private fb: FormBuilder, private trabajadorService: TrabajadorService) {
    this.trabajadorForm = this.fb.group({
      dni: ['', [Validators.required, Validators.minLength(8)]],
      nombreCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: [''],
      fechaNacimiento: [''],
      colegiatura: [''],
      rolId: ['', Validators.required]
    });
  }

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

  prepararEdicion(trabajador: Trabajador) {
    this.isEditMode = true;
    this.idSeleccionado = trabajador.id;
    this.isModalOpen = true;

    // Llenamos el formulario con los datos del trabajador
    this.trabajadorForm.patchValue({
      dni: trabajador.dni,
      nombreCompleto: trabajador.nombreCompleto,
      username: trabajador.username,
      email: trabajador.email,
      telefono: trabajador.telefono,
      fechaNacimiento: trabajador.fechaNacimiento,
      colegiatura: trabajador.colegiatura,
      rolId: 1 // Aquí deberías mapear el ID real del rol
    });
    
    // La contraseña no es obligatoria al editar
    this.trabajadorForm.get('password')?.clearValidators();
    this.trabajadorForm.get('password')?.updateValueAndValidity();
  }

  guardarTrabajador() {
    if (this.trabajadorForm.invalid) return;

    if (this.isEditMode && this.idSeleccionado) {
      // LLAMADA A ACTUALIZAR
      this.trabajadorService.actualizar(this.idSeleccionado, this.trabajadorForm.value).subscribe({
        next: () => {
          this.finalizarOperacion();
          alert('Trabajador actualizado con éxito');
        }
      });
    } else {
      // LLAMADA A CREAR (lo que ya tenías)
      this.trabajadorService.crear(this.trabajadorForm.value).subscribe({
        next: () => this.finalizarOperacion()
      });
    }
  }

  cambiarEstado(trabajador: Trabajador) {
    const accion = trabajador.activo ? 'desactivar' : 'reactivar';
    
    if (confirm(`¿Estás seguro de que deseas ${accion} a este trabajador?`)) {
      this.trabajadorService.cambiarEstado(trabajador.id).subscribe({
        next: () => {
          this.cargarTrabajadores();
          // Opcional: un alert pequeñito
          alert(`Trabajador ${trabajador.activo ? 'desactivado' : 'reactivado'} correctamente.`);
        }
      });
    }
  }

  // Limpia todo al cerrar o terminar
  finalizarOperacion() {
    this.cerrarModal();
    this.cargarTrabajadores();
    this.trabajadorForm.reset();
    this.isEditMode = false;
    this.idSeleccionado = null;
  }

  abrirModal(): void { this.isModalOpen = true; }
  cerrarModal(): void { this.isModalOpen = false; }
}