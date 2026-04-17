import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { HeaderComponent } from '../../shared/header/header.component';

interface ItemDeuda {
  concepto: string;
  monto:    number;
  checked:  boolean;
}

@Component({
  selector: 'app-caja-facturacion',
  standalone: true,
  imports: [HeaderComponent, FormsModule, DecimalPipe],
  templateUrl: './caja-facturacion.component.html',
  styleUrl: './caja-facturacion.component.scss'
})

export class CajaFacturacionComponent {

  deudas: ItemDeuda[] = [
    { concepto: 'Gastos de Cita - Cardiología',        monto: 80.00, checked: false },
    { concepto: 'Gastos de Medicina - Receta REC-9921', monto: 45.50, checked: false }
  ];

  metodosPago = [
    { value: 'efectivo',   label: 'Efectivo'                          },
    { value: 'tarjeta',    label: 'Tarjeta de Crédito/Débito'         },
    { value: 'billetera',  label: 'Billetera Electrónica (Yape/Plin)' }
  ];

  tiposComprobante = [
    { value: 'boleta',   label: 'Boleta de Venta' },
    { value: 'factura',  label: 'Factura'          }
  ];

  conceptosDeuda = [
    { value: 'todos',      label: 'Todos'               },
    { value: 'emergencia', label: 'Gastos de Emergencia' },
    { value: 'cita',       label: 'Gastos de Cita'       },
    { value: 'medicina',   label: 'Gastos de Medicina'   }
  ];

  get totalSeleccionado(): number {
    return this.deudas
      .filter(d => d.checked)
      .reduce((sum, d) => sum + d.monto, 0);
  }
}