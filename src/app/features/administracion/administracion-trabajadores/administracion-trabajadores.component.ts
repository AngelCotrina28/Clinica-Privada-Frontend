/*import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TrabajadorService } from '../../../core/services/Trabajador.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  templateUrl: './administracion-trabajadores.component.html',
  styleUrls: ['./administracion-trabajadores.component.scss']
})
export class AdministracionTrabajadoresComponent implements OnInit {
  TrabajadorForm!: FormGroup;
  mensajeError: string = '';
  Trabajadors: any[] = []; 

  constructor(
    private fb: FormBuilder,
    private TrabajadorService: TrabajadorService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarTrabajadors(); 
  }

  inicializarFormulario(): void {
    this.TrabajadorForm = this.fb.group({
      dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      nombreCompleto: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rolId: ['', Validators.required]
    });
  }

  cargarTrabajadors(): void {
    this.TrabajadorService.listarTrabajadors().subscribe({
      next: (data) => {
        this.Trabajadors = data;
      },
      error: (err) => {
        console.error('Error al cargar Trabajadors', err);
      }
    });
  }

  // Se activa al presionar el botón de arriba
  abrirModal(modalContent: any): void {
    this.TrabajadorForm.reset();
    this.mensajeError = '';
    this.modalService.open(modalContent, { backdrop: 'static', size: 'lg', centered: true }); 
  }

  registrar(modalActivo: any): void {
    if (this.TrabajadorForm.invalid) {
      this.TrabajadorForm.markAllAsTouched();
      return;
    }

    this.TrabajadorService.registrarTrabajador(this.TrabajadorForm.value).subscribe({
      next: (res) => {
        alert('¡Personal registrado exitosamente!'); 
        modalActivo.close(); 
        this.cargarTrabajadors(); 
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Ocurrió un error al registrar el Trabajador.';
      }
    });
  }
}*/
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trabajadores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './administracion-trabajadores.component.html',
  styleUrl: './administracion-trabajadores.component.scss'
})
export class AdministracionTrabajadoresComponent {
  
  // Variable que controla si el modal se ve o no
  isModalOpen: boolean = false;

  abrirModal(): void {
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
  }

}