import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
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
export class SidebarComponent implements OnInit {

  private authService = inject(AuthService);

  colapsado = signal(false);
  adminAbierto = signal(false);
  admisionAbierto = signal(false);

  rolActual = signal<string>('');

  ngOnInit() {
    this.authService.rolActual$.subscribe(rol => {
      if (rol) {
        this.rolActual.set(rol);
      }
    });
  }

  navItems: NavItem[] = [
    {
      label: '🏠 Inicio',
      route: '/dashboard',
      rolesPermitidos: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ENFERMERO', 'JEFE_ENFERMERIA', 'MEDICO', 'TECNICO_FARMACIA', 'CAJERO']
    },

    {
      label: '📋 Admisión y Consultas',
      rolesPermitidos: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ENFERMERO', 'JEFE_ENFERMERIA'],
      children: [
        { label: 'Gestión de Historias', route: '/admision/historias', rolesPermitidos: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ENFERMERO', 'JEFE_ENFERMERIA'] },
        { label: 'Flujo de Emergencia', route: '/admision/emergencia', rolesPermitidos: ['ADMINISTRADOR', 'JEFE_ENFERMERIA'] },
        { label: 'Consulta Externa', route: '/admision/consulta', rolesPermitidos: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ENFERMERO', 'JEFE_ENFERMERIA'] },
      ]
    },


    {
      label: '🩺 Atención Médica',
      route: '/atencion-medica',
      rolesPermitidos: ['ADMINISTRADOR', 'MEDICO']
    },

    {
      label: '💊 Farmacia',
      route: '/farmacia',
      rolesPermitidos: ['ADMINISTRADOR', 'TECNICO_FARMACIA']
    },

    {
      label: '🧾 Caja y Facturación',
      route: '/caja-facturacion',
      rolesPermitidos: ['ADMINISTRADOR', 'CAJERO']
    },

    {
      label: '👨🏻‍💻 Administración',
      rolesPermitidos: ['ADMINISTRADOR'],
      children: [
        { label: 'Administrar Trabajadores', route: '/administracion/trabajadores', rolesPermitidos: ['ADMINISTRADOR'] },
        { label: 'Series de Comprobantes', route: '/administracion/series', rolesPermitidos: ['ADMINISTRADOR'] },
        { label: 'Asignación de Cajas', route: '/administracion/cajas', rolesPermitidos: ['ADMINISTRADOR'] }
      ]
    },
  ];

  navItemsFiltrados = computed(() => {
    return this.navItems.filter(item => item.rolesPermitidos.includes(this.rolActual()));
  });

  toggleSidebar(): void {
    this.colapsado.update(v => !v);
    if (this.colapsado()) {
      this.adminAbierto.set(false);
      this.admisionAbierto.set(false); // Aprovechamos para limpiar este también
    }
  }

  // Función para abrir/cerrar los trocitos
  toggleAdmin(): void {
    if (this.colapsado()) {
      this.colapsado.set(false);
    }
    this.adminAbierto.update(v => !v);
  }

  toggleAdmision(): void {
    if (this.colapsado()) this.colapsado.set(false);
    this.admisionAbierto.update(v => !v);
  }

  estaAbierto(label: string): boolean {
    if (label.includes('Admisión')) return this.admisionAbierto();
    if (label.includes('Administración')) return this.adminAbierto();
    return false;
  }

  toggle(label: string): void {
    if (label.includes('Admisión')) this.toggleAdmision();
    else if (label.includes('Administración')) this.toggleAdmin();
  }
}