import { Component } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';

interface OrdenDespacho {
  nroReceta:     string;
  paciente:      string;
  origen:        string;
  estadoPago:    string;
}

// Interfaz para tipar los datos de la tabla de inventario
interface Medicamento {
  id: number;
  codigo: string;
  nombre: string;
  presentacion: string;
  categoriaNombre: string;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number;
  requiereReceta: boolean;
}

@Component({
  selector: 'app-farmacia',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './farmacia.component.html',
  styleUrl: './farmacia.component.scss'
})
export class FarmaciaComponent {

  ordenesPendientes: OrdenDespacho[] = [
    {
      nroReceta:  'REC-9921',
      paciente:   'María Gómez',
      origen:     'Consulta Externa',
      estadoPago: 'Pagado'
    }
  ];

  // Arreglo de medicamentos con datos de prueba
  medicamentos: Medicamento[] = [
    {
      id: 1,
      codigo: 'MED-001',
      nombre: 'Paracetamol',
      presentacion: 'Caja x 100 tabletas 500mg',
      categoriaNombre: 'Analgésicos',
      stockActual: 50,
      stockMinimo: 20,
      precioUnitario: 0.50,
      requiereReceta: false
    },
    {
      id: 2,
      codigo: 'MED-002',
      nombre: 'Amoxicilina',
      presentacion: 'Frasco 250mg/5ml suspensión',
      categoriaNombre: 'Antibióticos',
      stockActual: 5, // Simulación de stock bajo para probar la alerta HTML
      stockMinimo: 15,
      precioUnitario: 12.50,
      requiereReceta: true
    }
  ];

  // Métodos para abrir y cerrar el <dialog> nativo de HTML5
  abrirModalCrear(): void {
    const modal = document.getElementById('modalMedicamento') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  }

  cerrarModal(): void {
    const modal = document.getElementById('modalMedicamento') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
  }

  // Métodos para las acciones de cada fila de la tabla
  verDetalle(med: Medicamento): void {
    console.log('Abriendo detalle del medicamento:', med.nombre);
    // Lógica para ver detalles
  }

  editarMedicamento(med: Medicamento): void {
    console.log('Editando medicamento con código:', med.codigo);
    // Lógica para cargar datos al formulario y abrir modal
  }

  desactivar(med: Medicamento): void {
    console.log('Desactivando medicamento (ID):', med.id);
    // Lógica de confirmación y desactivación
  }
}