import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
<<<<<<< HEAD
=======

>>>>>>> 493cebeb0b0735ed9444b44c5ee4385f742d73a5
  {
    path: 'dashboard',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ENFERMERO', 'JEFE_ENFERMERIA', 'MEDICO', 'TECNICO_FARMACIA', 'CAJERO'] },
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'admision',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'RECEPCIONISTA', 'ENFERMERO', 'JEFE_ENFERMERIA'] },
    children: [
      { path: '', redirectTo: 'historias', pathMatch: 'full' },
<<<<<<< HEAD
      {
        path: 'historias',
        loadComponent: () => import('./features/admision/historias/admision-historias.component').then(m => m.AdmisionHistoriasComponent)
      },
      {
        path: 'emergencia',
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'JEFE_ENFERMERIA'] },
        loadComponent: () => import('./features/admision/emergencia/admision-emergencia.component').then(m => m.AdmisionEmergenciaComponent)
      },
      {
        path: 'consulta',
        loadComponent: () => import('./features/admision/consulta/admision-consulta.component').then(m => m.AdmisionConsultaComponent)
      },
=======
      { path: 'historias', loadComponent: () => import('./features/admision/historias/admision-historias.component').then(m => m.AdmisionHistoriasComponent) },
      { path: 'emergencia', canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR', 'JEFE_ENFERMERIA'] }, loadComponent: () => import('./features/admision/emergencia/admision-emergencia.component').then(m => m.AdmisionEmergenciaComponent) },
      { path: 'consulta', loadComponent: () => import('./features/admision/consulta/admision-consulta.component').then(m => m.AdmisionConsultaComponent) },
>>>>>>> 493cebeb0b0735ed9444b44c5ee4385f742d73a5
    ]
  },
  {
    path: 'atencion-medica',
<<<<<<< HEAD
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'MEDICO'] },
    loadComponent: () => import('./features/atencion-medica/atencion-medica.component').then(m => m.AtencionMedicaComponent)
  },

  // ── FARMACIA CON RUTAS HIJAS ─────────────────────────────────
=======
    loadComponent: () => import('./features/atencion-medica/atencion-medica.component').then(m => m.AtencionMedicaComponent),
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'MEDICO'] },
    children: [
      {
        path: 'historial-clinico',
        loadComponent: () => import('./features/atencion-medica/historial-clinico/historial-clinico.component').then(m => m.HistorialClinicoComponent)
      },
      {
        path: 'registro-resultados',
        loadComponent: () => import('./features/atencion-medica/registro-resultados/registro-resultados.component').then(m => m.RegistroResultadosComponent)
      },
      {
        path: 'receta-medica',
        loadComponent: () => import('./features/atencion-medica/receta-medica/receta-medica.component').then(m => m.RecetaMedicaComponent)
      },
      {
        path: '',
        redirectTo: 'historial-clinico',
        pathMatch: 'full'
      }
    ]
  },
>>>>>>> 493cebeb0b0735ed9444b44c5ee4385f742d73a5
  {
    path: 'farmacia',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'TECNICO_FARMACIA'] },
<<<<<<< HEAD
    children: [
      { path: '', redirectTo: 'despacho', pathMatch: 'full' },
      {
        path: 'despacho',
        loadComponent: () =>
          import('./features/farmacia/despacho/farmacia-despacho.component')
            .then(m => m.FarmaciaDespachoComponent)
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./features/farmacia/inventario/farmacia-inventario.component')
            .then(m => m.FarmaciaInventarioComponent)
      },
      {
        path: 'stock-bajo',
        loadComponent: () =>
          import('./features/farmacia/stock-bajo/farmacia-stock-bajo.component')
            .then(m => m.FarmaciaStockBajoComponent)
      },
    ]
  },

=======
    loadComponent: () => import('./features/farmacia/farmacia.component').then(m => m.FarmaciaComponent)
  },
>>>>>>> 493cebeb0b0735ed9444b44c5ee4385f742d73a5
  {
    path: 'caja-facturacion',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'CAJERO'] },
    loadComponent: () => import('./features/caja-facturacion/caja-facturacion.component').then(m => m.CajaFacturacionComponent)
  },
  {
    path: 'administracion',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR'] },
    children: [
      {
        path: 'trabajadores',
        loadComponent: () => import('./features/administracion/administracion-trabajadores/administracion-trabajadores.component').then(m => m.AdministracionTrabajadoresComponent)
      },
      {
        path: 'cajas',
        loadComponent: () => import('./features/administracion/asignacion-cajas/asignacion-cajas.component').then(m => m.AsignacionCajasComponent)
      },
      {
        path: 'series',
        loadComponent: () => import('./features/administracion/series-comprobantes/series-comprobantes.component').then(m => m.SeriesComprobantesComponent)
      },
      {
        path: '',
        redirectTo: 'trabajadores',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];