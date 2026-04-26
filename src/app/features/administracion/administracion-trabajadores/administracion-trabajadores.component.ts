import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../core/services/usuario.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  templateUrl: './administracion-trabajadores.component.html',
  styleUrls: ['./administracion-trabajadores.component.scss']
})
export class AdministracionTrabajadoresComponent implements OnInit {
  usuarioForm!: FormGroup;
  mensajeError: string = '';
  usuarios: any[] = []; 

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarUsuarios(); 
  }

  inicializarFormulario(): void {
    this.usuarioForm = this.fb.group({
      dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      nombreCompleto: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rolId: ['', Validators.required]
    });
  }

  cargarUsuarios(): void {
    this.usuarioService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
      },
      error: (err) => {
        console.error('Error al cargar usuarios', err);
      }
    });
  }

  // Se activa al presionar el botón de arriba
  abrirModal(modalContent: any): void {
    this.usuarioForm.reset();
    this.mensajeError = '';
    this.modalService.open(modalContent, { backdrop: 'static', size: 'lg', centered: true }); 
  }

  registrar(modalActivo: any): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.usuarioService.registrarUsuario(this.usuarioForm.value).subscribe({
      next: (res) => {
        alert('¡Personal registrado exitosamente!'); 
        modalActivo.close(); 
        this.cargarUsuarios(); 
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Ocurrió un error al registrar el usuario.';
      }
    });
  }
}