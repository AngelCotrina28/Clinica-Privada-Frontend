import { Routes } from '@angular/router';

export const routes: Routes = [
  // Redirige la raíz al dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // Lazy loading por feature — Angular solo carga el código
  // de cada módulo cuando el usuario navega a esa ruta.
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'admision',
    loadComponent: () =>
      import('./features/admision/admision.component')
        .then(m => m.AdmisionComponent)
  },
  {
    path: 'atencion-medica',
    loadComponent: () =>
      import('./features/atencion-medica/atencion-medica.component')
        .then(m => m.AtencionMedicaComponent)
  },
  {
    path: 'farmacia',
    loadComponent: () =>
      import('./features/farmacia/farmacia.component')
        .then(m => m.FarmaciaComponent)
  },
  {
    path: 'caja-facturacion',
    loadComponent: () =>
      import('./features/caja-facturacion/caja-facturacion.component')
        .then(m => m.CajaFacturacionComponent)
  },
  {
    path: 'administracion',
    loadComponent: () =>
      import('./features/administracion/administracion.component')
        .then(m => m.AdministracionComponent)
  },

  // Cualquier ruta desconocida vuelve al dashboard
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];