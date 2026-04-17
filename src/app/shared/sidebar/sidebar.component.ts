import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  route: string;
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

  navItems: NavItem[] = [
    { label: 'Inicio',               route: '/dashboard'          },
    { label: 'Admisión y Consultas', route: '/admision'           },
    { label: 'Atención Médica',      route: '/atencion-medica'    },
    { label: 'Farmacia',             route: '/farmacia'           },
    { label: 'Caja y Facturación',   route: '/caja-facturacion'   },
    { label: 'Administración',       route: '/administracion'     },
  ];

  toggleSidebar(): void {
    this.colapsado.update(v => !v);
  }
}