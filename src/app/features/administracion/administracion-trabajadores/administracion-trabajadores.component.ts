import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrabajadorService } from '../../../core/services/trabajador.service';
import { Trabajador } from '../../../core/model/trabajador.model';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../shared/header/header.component';

interface RolFiltro {
  id: number;
  nombre: string;
}


@Component({
  selector: 'app-administracion-trabajadores',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HeaderComponent],
  templateUrl: './administracion-trabajadores.component.html',
  styleUrl: './administracion-trabajadores.component.scss'
})
export class AdministracionTrabajadoresComponent implements OnInit {
  
  isEditMode: boolean = false;
  idSeleccionado: number | null = null;
  trabajadorForm: FormGroup;
  listaTrabajadores: Trabajador[] = [];
  isModalOpen: boolean = false;
  especialidadesDisponibles: any[] = [];
  especialidadesSeleccionadasIds: number[] = [];
  busquedaTrabajador = '';
  rolSeleccionado = '';
  mostrarInactivos = false;

  constructor(
    private fb: FormBuilder, 
    private trabajadorService: TrabajadorService, 
    private especialidadService: EspecialidadService) {
      this.trabajadorForm = this.fb.group({
      dni: ['', [Validators.required, Validators.minLength(8)]],
      nombreCompleto: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: [''],
      fechaNacimiento: [''],
      colegiatura: [''],
      rolId: ['', Validators.required],
      especialidadesIds: [[]]
    });
    
      this.trabajadorForm.get('rolId')?.valueChanges.subscribe(rolId => {
      const colegiaturaControl = this.trabajadorForm.get('colegiatura');
      
      // Suponiendo que el ID 2 es "Médico" (según tu HTML anterior)
      if (rolId === "2") { 
        // Si es médico, agregamos la validación de obligatorio
        colegiaturaControl?.setValidators([Validators.required]);
      } else {
        // Si es cualquier otro rol, limpiamos las validaciones
        colegiaturaControl?.clearValidators();
      }
      
      // Refrescamos el estado del campo para que Angular se entere del cambio
      colegiaturaControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.cargarTrabajadores();
    this.especialidadService.listar().subscribe({
      next: (data) => {
        this.especialidadesDisponibles = data;
        console.log('Especialidades cargadas:', data); // para confirmar
      },
      error: (err) => {
        console.error('❌ Error al cargar especialidades:', err);
      }
    });
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

  get rolesDisponibles(): RolFiltro[] {
    const roles = new Map<number, string>();
    this.listaTrabajadores.forEach(t => {
      if (t.rolId && t.nombreRol) {
        roles.set(t.rolId, t.nombreRol);
      }
    });

    return Array.from(roles, ([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  get trabajadoresFiltrados(): Trabajador[] {
    const busqueda = this.busquedaTrabajador.trim().toLowerCase();

    return this.listaTrabajadores.filter(t => {
      const coincideEstado = this.mostrarInactivos || t.activo;
      const coincideRol = !this.rolSeleccionado || String(t.rolId) === this.rolSeleccionado;
      const coincideBusqueda = !busqueda || [
        t.dni,
        t.nombreCompleto,
        t.email,
        t.nombreRol
      ].some(valor => valor?.toLowerCase().includes(busqueda));

      return coincideEstado && coincideRol && coincideBusqueda;
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
      telefono: trabajador.telefono,
      fechaNacimiento: trabajador.fechaNacimiento,
      colegiatura: trabajador.colegiatura,
      rolId: trabajador.rolId.toString()
    });
    
    // La contraseña no es obligatoria al editar
    this.trabajadorForm.get('password')?.clearValidators();
    this.trabajadorForm.get('password')?.updateValueAndValidity();
  }

  guardarTrabajador() {
    if (this.trabajadorForm.invalid) return;
    console.log('Enviando:', this.trabajadorForm.value);
    if (this.isEditMode && this.idSeleccionado) {
      // MODO EDICIÓN
      this.trabajadorService.actualizar(this.idSeleccionado, this.trabajadorForm.value).subscribe({
        next: () => {
          this.finalizarOperacion();
          alert('✅ Trabajador actualizado con éxito.');
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          // Atrapamos el mensaje de error de Springs Boot
          const mensaje = err.error?.mensaje || 'Error al actualizar. Verifica que el DNI o Correo no estén repetidos.';
          alert('❌ ' + mensaje);
        }
      });
    } else {
      // MODO CREACIÓN
      this.trabajadorService.crear(this.trabajadorForm.value).subscribe({
        next: () => {
          this.finalizarOperacion();
          alert('✅ Trabajador registrado con éxito.');
        },
        error: (err) => {
          console.error('Error al crear:', err);
          // Atrapamos el mensaje de error de Spring Boot ("El correo ya está registrado")
          const mensaje = err.error?.mensaje || 'Error al registrar. Verifica que el DNI o Correo no estén repetidos en el sistema.';
          alert('❌ ' + mensaje);
        }
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
  toggleEspecialidad(id: number) {
    const index = this.especialidadesSeleccionadasIds.indexOf(id);
    if (index > -1) {
      this.especialidadesSeleccionadasIds.splice(index, 1);
    } else {
      this.especialidadesSeleccionadasIds.push(id);
    }
    // Actualizamos el valor en el formulario reactivo
    this.trabajadorForm.patchValue({ especialidadesIds: this.especialidadesSeleccionadasIds });
  }

  esEspecialidadSeleccionada(id: number): boolean {
    return this.especialidadesSeleccionadasIds.includes(id);
  }

  abrirModalParaCrear(): void {
    // 1. Decimos que NO estamos editando
    this.especialidadesSeleccionadasIds = [];
    this.isEditMode = false;
    this.idSeleccionado = null;

    // 2. ¡ESTA ES LA CLAVE! Limpiamos todos los inputs
    this.trabajadorForm.reset({
      // Puedes pasar valores por defecto aquí si quieres
      rolId: '', 
      activo: true
    });

    // 3. Volvemos a poner la contraseña como obligatoria (por si veníamos de editar)
    this.trabajadorForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.trabajadorForm.get('password')?.updateValueAndValidity();

    // 4. Recién ahí abrimos el modal
    this.isModalOpen = true;
  }
  
  cerrarModal(): void {
    this.isModalOpen = false;
    this.trabajadorForm.reset();
    this.isEditMode = false;
    this.especialidadesSeleccionadasIds = []; // 👈 limpiar esto también
  }
}
