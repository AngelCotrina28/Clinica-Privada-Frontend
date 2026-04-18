import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../core/services/usuario.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  templateUrl: './administracion.component.html',
  styleUrls: ['./administracion.component.scss']
})
export class AdministracionComponent implements OnInit {
  usuarioForm!: FormGroup;
  mensajeExito: string = '';
  mensajeError: string = '';
  usuarios: any[] = []; // Array que guarda la lista de usuarios del backend

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarUsuarios(); // Se ejecuta al entrar a la página
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

  // Trae los usuarios de Spring Boot
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

  // Abre el Modal flotante
  abrirModal(modalContent: any): void {
    this.usuarioForm.reset();
    this.mensajeExito = '';
    this.mensajeError = '';
    this.modalService.open(modalContent, { backdrop: 'static', size: 'lg' }); 
  }

  // Registra un nuevo usuario y actualiza la tabla
  registrar(modalActivo: any): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.usuarioService.registrarUsuario(this.usuarioForm.value).subscribe({
      next: (res) => {
        alert('¡Personal registrado correctamente!'); 
        modalActivo.close(); // Cierra la ventanita
        this.cargarUsuarios(); // Refresca la tabla automáticamente
      },
      error: (err) => {
        this.mensajeError = err.error?.message || 'Ocurrió un error al registrar el usuario.';
      }
    });
  }
}