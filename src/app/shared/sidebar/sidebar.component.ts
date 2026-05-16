import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
<<<<<<< HEAD

interface NavItem {
  label: string;
  route?: string;
  children?: NavItem[];
=======
interface NavItem {
  label: string;
  route?: string; // Ahora es opcional porque el padre puede no tener ruta
  children?: NavItem[]; // Aquí van los "trocitos"
>>>>>>> 493cebeb0b0735ed9444b44c5ee4385f742d73a5
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

<<<<<<< HEAD
  colapsado      = signal(false);
  adminAbierto   = signal(false);
  admisionAbierto = signal(false);
  farmaciaAbierto = signal(false);   // ← NUEVO
=======
  colapsado = signal(false);
  adminAbierto = signal(false);
  admisionAbierto = signal(false);
>>>>>>> 493cebeb0b0735ed9444b44c5ee4385f742d73a5

  rolActual = signal<string>('');

  ngOnInit() {
    this.authService.rolActual$.subscribe(rol => {
<<<<<<< HEAD
      if (rol) this.rolActual.set(rol);
=======
      if (rol) {
        this.rolActual.set(rol);
      }
>>>>>>> 493cebeb0b0735ed9444b44c5ee4385f742d73a5
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
<<<<<<< HEAD
        { label: 'Gestión de Historias',  route: '/admision/historias',  rolesPermitidos: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ENFERMERO', 'JEFE_ENFERMERIA'] },
        { label: 'Flujo de Emergencia',   route: '/admision/emergencia', rolesPermitidos: ['ADMINISTRADOR', 'JEFE_ENFERMERIA'] },
        { label: 'Consulta Externa',      route: '/admision/consulta',   rolesPermitidos: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ENFERMERO', 'JEFE_ENFERMERIA'] },
      ]
    },

=======
        { label: 'Gestión de Historias', route: '/admision/historias', rolesPermitidos: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ENFERMERO', 'JEFE_ENFERMERIA'] },
        { label: 'Flujo de Emergencia', route: '/admision/emergencia', rolesPermitidos: ['ADMINISTRADOR', 'JEFE_ENFERMERIA'] },
        { label: 'Consulta Externa', route: '/admision/consulta', rolesPermitidos: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ENFERMERO', 'JEFE_ENFERMERIA'] },
      ]
    },


>>>>>>> 493cebeb0b0735ed9444b44c5ee4385f742d73a5
    {
      label: '🩺 Atención Médica',
      route: '/atencion-medica',
      rolesPermitidos: ['ADMINISTRADOR', 'MEDICO']
    },

<<<<<<< HEAD
    // ── FARMACIA CON SUB-SECCIONES ─────────────────────────
    {
      label: '💊 Farmacia',
      rolesPermitidos: ['ADMINISTRADOR', 'TECNICO_FARMACIA'],
      children: [
        { label: 'Despacho de Medicamentos', route: '/farmacia/despacho',   rolesPermitidos: ['ADMINISTRADOR', 'TECNICO_FARMACIA'] },
        { label: 'Inventario',               route: '/farmacia/inventario',  rolesPermitidos: ['ADMINISTRADOR'] },
        { label: 'Alertas de Stock',         route: '/farmacia/stock-bajo',  rolesPermitidos: ['ADMINISTRADOR', 'TECNICO_FARMACIA'] },
      ]
=======
    {
      label: '💊 Farmacia',
      route: '/farmacia',
      rolesPermitidos: ['ADMINISTRADOR', 'TECNICO_FARMACIA']
>>>>>>> 493cebeb0b0735ed9444b44c5ee4385f742d73a5
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
<<<<<<< HEAD
        { label: 'Series de Comprobantes',   route: '/administracion/series',       rolesPermitidos: ['ADMINISTRADOR'] },
        { label: 'Asignación de Cajas',      route: '/administracion/cajas',        rolesPermitidos: ['ADMINISTRADOR'] }
=======
        { label: 'Series de Comprobantes', route: '/administracion/series', rolesPermitidos: ['ADMINISTRADOR'] },
        { label: 'Asignación de Cajas', route: '/administracion/cajas', rolesPermitidos: ['ADMINISTRADOR'] }
>>>>>>> 493cebeb0b0735ed9444b44c5ee4385f742d73a5
      ]
    },
  ];

<<<<<<< HEAD
  navItemsFiltrados = computed(() =>
    this.navItems.filter(item => item.rolesPermitidos.includes(this.rolActual()))
  );

  // ── Toggle helpers ─────────────────────────────────────────
=======
  navItemsFiltrados = computed(() => {
    return this.navItems.filter(item => item.rolesPermitidos.includes(this.rolActual()));
  });

>>>>>>> 493cebeb0b0735ed9444b44c5ee4385f742d73a5
  toggleSidebar(): void {
    this.colapsado.update(v => !v);
    if (this.colapsado()) {
      this.adminAbierto.set(false);
<<<<<<< HEAD
      this.admisionAbierto.set(false);
      this.farmaciaAbierto.set(false);
    }
  }

  toggleAdmin(): void {
    if (this.colapsado()) this.colapsado.set(false);
=======
      this.admisionAbierto.set(false); // Aprovechamos para limpiar este también
    }
  }

  // Función para abrir/cerrar los trocitos
  toggleAdmin(): void {
    if (this.colapsado()) {
      this.colapsado.set(false);
    }
>>>>>>> 493cebeb0b0735ed9444b44c5ee4385f742d73a5
    this.adminAbierto.update(v => !v);
  }

  toggleAdmision(): void {
    if (this.colapsado()) this.colapsado.set(false);
    this.admisionAbierto.update(v => !v);
  }

<<<<<<< HEAD
  toggleFarmacia(): void {
    if (this.colapsado()) this.colapsado.set(false);
    this.farmaciaAbierto.update(v => !v);
  }

  estaAbierto(label: string): boolean {
    if (label.includes('Admisión'))       return this.admisionAbierto();
    if (label.includes('Administración')) return this.adminAbierto();
    if (label.includes('Farmacia'))       return this.farmaciaAbierto();
=======
  estaAbierto(label: string): boolean {
    if (label.includes('Admisión')) return this.admisionAbierto();
    if (label.includes('Administración')) return this.adminAbierto();
>>>>>>> 493cebeb0b0735ed9444b44c5ee4385f742d73a5
    return false;
  }

  toggle(label: string): void {
<<<<<<< HEAD
    if (label.includes('Admisión'))       this.toggleAdmision();
    else if (label.includes('Administración')) this.toggleAdmin();
    else if (label.includes('Farmacia'))  this.toggleFarmacia();
=======
    if (label.includes('Admisión')) this.toggleAdmision();
    else if (label.includes('Administración')) this.toggleAdmin();
>>>>>>> 493cebeb0b0735ed9444b44c5ee4385f742d73a5
  }
}