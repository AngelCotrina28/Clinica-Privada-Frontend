import { Component, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
interface NavItem {
  label: string;
  route?: string; // Ahora es opcional porque el padre puede no tener ruta
  children?: NavItem[]; // Aquí van los "trocitos"
  rolesPermitidos: string[];
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

  rolActual = signal<string>('RECEPCIONISTA'); // Se puede cambiar a 'CAJERO', 'MEDICO', etc.

  navItems: NavItem[] = [
    { label: '🏠 Inicio',
      route: '/dashboard',
      rolesPermitidos: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ENFERMERA', 'JEFA_ENFERMERA', 'MEDICO'] },

    { label: '📋 Admisión y Consultas',
      route: '/admision',

      rolesPermitidos: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ENFERMERA', 'JEFA_ENFERMERA'] },
    { label: '🩺 Atención Médica',
      route: '/atencion-medica',
      rolesPermitidos: ['ADMINISTRADOR', 'MEDICO']},

    { label: '💊 Farmacia',
      route: '/farmacia',
      rolesPermitidos: ['ADMINISTRADOR', 'TECNICO_FARMACIA']},

    { label: '🧾 Caja y Facturación',
      route: '/caja-facturacion',
      rolesPermitidos: ['ADMINISTRADOR', 'CAJERO'] },

    { label: '👨🏻‍💻 Administración',
      rolesPermitidos: ['ADMINISTRADOR'],
      children: [
        { label: 'Administrar Trabajadores',  route: '/administracion/trabajadores', rolesPermitidos: ['ADMINISTRADOR'] },
        { label: 'Series de Comprobantes',    route: '/administracion/series', rolesPermitidos: ['ADMINISTRADOR'] },
        { label: 'Asignación de Cajas',       route: '/administracion/cajas', rolesPermitidos: ['ADMINISTRADOR'] }
      ]
    },
  ];

  navItemsFiltrados = computed(() => {
    return this.navItems.filter(item => item.rolesPermitidos.includes(this.rolActual()));
  });

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