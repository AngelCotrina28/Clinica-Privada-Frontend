import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrabajadorService } from '../../../core/services/trabajador.service';
import { Trabajador } from '../../../core/model/trabajador.model';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../shared/header/header.component';
import { controlErrorMessage, FORM_PATTERNS, fechaHoyIso, noFutureDateValidator, patternValidator } from '../../../core/validators/form-validations';

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
  readonly fechaMaximaNacimiento = fechaHoyIso();

  constructor(
    private fb: FormBuilder, 
    private trabajadorService: TrabajadorService, 
    private especialidadService: EspecialidadService) {
      this.trabajadorForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(FORM_PATTERNS.dni)]],
      nombreCompleto: ['', [Validators.required, Validators.maxLength(150), patternValidator(FORM_PATTERNS.nombrePersona, 'pattern')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['', [patternValidator(FORM_PATTERNS.telefono, 'pattern')]],
      fechaNacimiento: ['', [Validators.required, noFutureDateValidator()]],
      colegiatura: ['', [Validators.maxLength(20), patternValidator(FORM_PATTERNS.codigoSimple, 'pattern')]],
      rolId: ['', Validators.required],
      especialidadesIds: [[]]
    });
    
      this.trabajadorForm.get('rolId')?.valueChanges.subscribe(rolId => {
      const colegiaturaControl = this.trabajadorForm.get('colegiatura');
      
      if (rolId === "2") { 
        colegiaturaControl?.setValidators([Validators.required]);
      } else {
        colegiaturaControl?.clearValidators();
      }
      
      colegiaturaControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.cargarTrabajadores();
    this.especialidadService.listar().subscribe({
      next: (data) => {
        this.especialidadesDisponibles = data;
      },
      error: (err) => {
        console.error('Error al cargar especialidades:', err);
      }
    });
  }

  cargarTrabajadores(): void {
    this.trabajadorService.listarTodos().subscribe({
      next: (data) => {
        this.listaTrabajadores = data;
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

    this.trabajadorForm.patchValue({
      dni: trabajador.dni,
      nombreCompleto: trabajador.nombreCompleto,
      telefono: trabajador.telefono,
      fechaNacimiento: trabajador.fechaNacimiento,
      colegiatura: trabajador.colegiatura,
      rolId: trabajador.rolId.toString()
    });
    
    this.trabajadorForm.get('password')?.clearValidators();
    this.trabajadorForm.get('password')?.updateValueAndValidity();
  }

  guardarTrabajador() {
    if (this.trabajadorForm.invalid) {
      this.trabajadorForm.markAllAsTouched();
      return;
    }
    if (this.isEditMode && this.idSeleccionado) {
      this.trabajadorService.actualizar(this.idSeleccionado, this.trabajadorForm.value).subscribe({
        next: () => {
          this.finalizarOperacion();
          alert('Trabajador actualizado con éxito.');
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          const mensaje = err.error?.mensaje || 'Error al actualizar. Verifica que el DNI o Correo no estén repetidos.';
          alert('Error: ' + mensaje);
        }
      });
    } else {
      this.trabajadorService.crear(this.trabajadorForm.value).subscribe({
        next: () => {
          this.finalizarOperacion();
          alert('Trabajador registrado con éxito.');
        },
        error: (err) => {
          console.error('Error al crear:', err);
          const mensaje = err.error?.mensaje || 'Error al registrar. Verifica que el DNI o Correo no estén repetidos en el sistema.';
          alert('Error: ' + mensaje);
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
          alert(`Trabajador ${trabajador.activo ? 'desactivado' : 'reactivado'} correctamente.`);
        }
      });
    }
  }

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
    this.trabajadorForm.patchValue({ especialidadesIds: this.especialidadesSeleccionadasIds });
  }

  esEspecialidadSeleccionada(id: number): boolean {
    return this.especialidadesSeleccionadasIds.includes(id);
  }

  abrirModalParaCrear(): void {
    this.especialidadesSeleccionadasIds = [];
    this.isEditMode = false;
    this.idSeleccionado = null;

    this.trabajadorForm.reset({
      rolId: '', 
      activo: true
    });

    this.trabajadorForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.trabajadorForm.get('password')?.updateValueAndValidity();

    this.isModalOpen = true;
  }
  
  cerrarModal(): void {
    this.isModalOpen = false;
    this.trabajadorForm.reset();
    this.isEditMode = false;
    this.especialidadesSeleccionadasIds = [];
  }

  campoInvalido(nombre: string): boolean {
    const control = this.trabajadorForm.get(nombre);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  mensajeCampo(nombre: string, etiqueta: string): string {
    return controlErrorMessage(this.trabajadorForm.get(nombre), etiqueta);
  }
}
