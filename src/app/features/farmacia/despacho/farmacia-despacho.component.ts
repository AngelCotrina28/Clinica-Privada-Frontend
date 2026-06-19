
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/header/header.component';

export interface OrdenDespacho {
  nroReceta:   string;
  paciente:    string;
  dni:         string;
  origen:      string;
  medicamentos: string[];
  estadoPago:  string;
}

@Component({
  selector: 'app-farmacia-despacho',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './farmacia-despacho.component.html',
  styleUrl: '../farmacia.component.scss'
})
export class FarmaciaDespachoComponent implements OnInit {

  usuarioNombre     = '';
  terminoBusqueda   = '';
  cargandoBusqueda  = signal(false);
  errorMensaje      = signal('');
  exitoMensaje      = signal('');
  confirmando       = signal(false);
  ordenSeleccionada: OrdenDespacho | null = null;

  ordenesPendientes: OrdenDespacho[] = [];

  private readonly todasLasOrdenes: OrdenDespacho[] = [...this.ordenesPendientes];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    this.usuarioNombre = usuario?.nombreCompleto || usuario?.username || 'Farmacia';
  }

  buscarOrden(): void {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    if (!termino) {
      this.ordenesPendientes = [...this.todasLasOrdenes];
      return;
    }
    this.cargandoBusqueda.set(true);
    this.ordenesPendientes = this.todasLasOrdenes.filter(o =>
      o.nroReceta.toLowerCase().includes(termino) ||
      o.dni.includes(termino) ||
      o.paciente.toLowerCase().includes(termino)
    );
    this.cargandoBusqueda.set(false);
  }

  registrarEntrega(orden: OrdenDespacho): void {
    if (orden.estadoPago !== 'Pagado') return;
    this.ordenSeleccionada = orden;
  }

  confirmarEntrega(): void {
    if (!this.ordenSeleccionada) return;
    this.errorMensaje.set('El registro de entrega aun no esta conectado al backend.');
    this.ordenSeleccionada = null;
  }

  imprimirOrden(orden: OrdenDespacho): void {
    window.print();
  }
}
