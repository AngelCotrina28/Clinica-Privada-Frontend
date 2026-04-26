import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  route?: string; // Ahora es opcional porque el padre puede no tener ruta
  children?: NavItem[]; // Aquí van los "trocitos"
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  colapsado = signal(false);
  // Nuevo Signal para los trocitos de administración
  adminAbierto = signal(false);

  navItems: NavItem[] = [
    { label: '🏠 Inicio',               route: '/dashboard'          },
    { label: '📋 Admisión y Consultas', route: '/admision'           },
    { label: '🩺 Atención Médica',      route: '/atencion-medica'    },
    { label: '💊 Farmacia',             route: '/farmacia'           },
    { label: '🧾 Caja y Facturación',   route: '/caja-facturacion'   },
    { label: '👨🏻‍💻 Administración', children: [{ label: 'Administrar Trabajadores', route: '/administracion/trabajadores' },
                                              { label: 'Series de Comprobantes',   route: '/administracion/series' },
                                              { label: 'Asignación de Cajas',      route: '/administracion/cajas' }
      ]
    },
  ];

  toggleSidebar(): void {
    this.colapsado.update(v => !v);
    if (this.colapsado()) {
      this.adminAbierto.set(false); // Cerramos trocitos si se colapsa la barra
    }
  }

  // Función para abrir/cerrar los trocitos
  toggleAdmin(): void {
    if (this.colapsado()) {
      this.colapsado.set(false);
    }
    this.adminAbierto.update(v => !v);
  }
}