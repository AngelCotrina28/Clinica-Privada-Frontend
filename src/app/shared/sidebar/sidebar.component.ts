import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, UsuarioSesion } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: IconName;
  route?: string;
  group?: string;
  children?: NavItem[];
  rolesPermitidos: string[];
}

type IconName =
  | 'home'
  | 'admission'
  | 'record'
  | 'emergency'
  | 'calendar'
  | 'medical'
  | 'pharmacy'
  | 'billing'
  | 'admin'
  | 'users'
  | 'schedule'
  | 'receipt'
  | 'cash';

const ROLES_TODOS = [
  'ADMINISTRADOR',
  'RECEPCIONISTA',
  'ENFERMERO',
  'JEFE_ENFERMERIA',
  'MEDICO',
  'TECNICO_FARMACIA',
  'CAJERO'
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  colapsado = signal(false);
  gruposAbiertos = signal<Record<string, boolean>>({
    admision: true,
    administracion: true
  });
  rolActual = signal('');
  usuarioActual = signal<UsuarioSesion | null>(null);

  readonly navItems: NavItem[] = [
    {
      label: 'Inicio',
      icon: 'home',
      route: '/dashboard',
      rolesPermitidos: ROLES_TODOS
    },
    {
      label: 'Admision y Consultas',
      icon: 'admission',
      group: 'admision',
      rolesPermitidos: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ENFERMERO', 'JEFE_ENFERMERIA'],
      children: [
        { label: 'Historias Clinicas', icon: 'record', route: '/admision/historias', rolesPermitidos: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ENFERMERO', 'JEFE_ENFERMERIA'] },
        { label: 'Emergencia', icon: 'emergency', route: '/admision/emergencia', rolesPermitidos: ['ADMINISTRADOR', 'ENFERMERO', 'JEFE_ENFERMERIA'] },
        { label: 'Consulta Externa', icon: 'calendar', route: '/admision/consulta', rolesPermitidos: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ENFERMERO', 'JEFE_ENFERMERIA'] }
      ]
    },
    {
      label: 'Atencion Medica',
      icon: 'medical',
      route: '/atencion-medica',
      rolesPermitidos: ['ADMINISTRADOR', 'MEDICO']
    },
    {
      label: 'Farmacia',
      icon: 'pharmacy',
      group: 'farmacia',
      rolesPermitidos: ['ADMINISTRADOR', 'TECNICO_FARMACIA'],
      children: [
        { label: 'Despacho de Medicamentos',icon: 'pharmacy', route: '/farmacia/despacho',   rolesPermitidos: ['ADMINISTRADOR', 'TECNICO_FARMACIA'] },
        { label: 'Inventario',icon: 'pharmacy', route: '/farmacia/inventario',  rolesPermitidos: ['ADMINISTRADOR'] },
        { label: 'Alertas de Stock',icon: 'pharmacy', route: '/farmacia/stock-bajo',  rolesPermitidos: ['ADMINISTRADOR', 'TECNICO_FARMACIA'] },
      ]
    },
    {
      label: 'Caja y Facturacion',
      icon: 'billing',
      route: '/caja-facturacion',
      rolesPermitidos: ['ADMINISTRADOR', 'CAJERO']
    },
    {
      label: 'Administracion',
      icon: 'admin',
      group: 'administracion',
      rolesPermitidos: ['ADMINISTRADOR'],
      children: [
        { label: 'Trabajadores', icon: 'users', route: '/administracion/trabajadores', rolesPermitidos: ['ADMINISTRADOR'] },
        { label: 'Horarios Medicos', icon: 'schedule', route: '/administracion/horarios-medicos', rolesPermitidos: ['ADMINISTRADOR'] },
        { label: 'Series de Comprobantes', icon: 'receipt', route: '/administracion/series', rolesPermitidos: ['ADMINISTRADOR'] },
        { label: 'Asignacion de Cajas', icon: 'cash', route: '/administracion/cajas', rolesPermitidos: ['ADMINISTRADOR'] }
      ]
    }
  ];

  private readonly iconos: Record<IconName, string[]> = {
    home: ['M3 11.5 12 4l9 7.5', 'M5.5 10.5V20h13v-9.5', 'M9 20v-6h6v6'],
    admission: ['M8 4h8l2 3v13H6V7l2-3z', 'M9 9h6', 'M9 13h6', 'M9 17h4'],
    record: ['M7 4h10v16H7z', 'M9.5 8h5', 'M9.5 12h5', 'M9.5 16h3'],
    emergency: ['M12 5v14', 'M5 12h14', 'M7.5 7.5l9 9', 'M16.5 7.5l-9 9'],
    calendar: ['M7 4v3', 'M17 4v3', 'M5 8h14', 'M6 6h12v14H6z'],
    medical: ['M8 5v6a4 4 0 0 0 8 0V5', 'M12 15v5', 'M9 20h6'],
    pharmacy: ['M7 12l5-5a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6-6z', 'M9.5 14.5l5-5'],
    billing: ['M4 7h16v10H4z', 'M4 10h16', 'M7 14h4'],
    admin: ['M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8z', 'M12 3v3', 'M12 18v3', 'M3 12h3', 'M18 12h3'],
    users: ['M9 11a3 3 0 1 0 0-6a3 3 0 0 0 0 6z', 'M17 11a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5z', 'M4 20a5 5 0 0 1 10 0', 'M14 18a4 4 0 0 1 6 2'],
    schedule: ['M6 5h12v15H6z', 'M8 9h8', 'M8 13h8', 'M8 17h4', 'M15 3v4'],
    receipt: ['M7 4h10v16l-2-1.2L13 20l-2-1.2L9 20l-2-1.2z', 'M9 8h6', 'M9 12h6', 'M9 16h4'],
    cash: ['M4 7h16v10H4z', 'M8 11h.01', 'M16 13h.01', 'M12 10a2 2 0 1 0 0 4a2 2 0 0 0 0-4z']
  };

  readonly navItemsFiltrados = computed(() => {
    const rol = this.rolActual();
    return this.navItems
      .filter(item => item.rolesPermitidos.includes(rol))
      .map(item => ({
        ...item,
        children: item.children?.filter(child => child.rolesPermitidos.includes(rol))
      }));
  });

  ngOnInit(): void {
    this.authService.rolActual$.subscribe(rol => this.rolActual.set(rol || ''));
    this.authService.usuarioActual$.subscribe(usuario => this.usuarioActual.set(usuario));
  }

  toggleSidebar(): void {
    this.colapsado.update(value => !value);
  }

  toggleGrupo(item: NavItem): void {
    if (!item.group) return;
    if (this.colapsado()) {
      this.colapsado.set(false);
    }
    this.gruposAbiertos.update(grupos => ({
      ...grupos,
      [item.group as string]: !grupos[item.group as string]
    }));
  }

  grupoAbierto(item: NavItem): boolean {
    return !!item.group && !!this.gruposAbiertos()[item.group];
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  obtenerIcono(icon: IconName): string[] {
    return this.iconos[icon];
  }

  rolVisible(): string {
    const rol = this.usuarioActual()?.rol || this.rolActual();
    if (!rol) return 'Sin sesion';
    return rol
      .toLowerCase()
      .split('_')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }

}
