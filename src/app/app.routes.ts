import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

const ROLES_TODOS = [
  'ADMINISTRADOR',
  'JEFE_ENFERMERIA',
  'ENFERMERO',
  'RECEPCIONISTA',
  'MEDICO',
  'TECNICO_FARMACIA',
  'CAJERO'
];

const ROLES_ADMISION = ['ADMINISTRADOR', 'JEFE_ENFERMERIA', 'ENFERMERO', 'RECEPCIONISTA'];

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
  {
    path: 'dashboard',
    canActivate: [roleGuard],
    data: { roles: ROLES_TODOS },
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'admision',
    canActivate: [roleGuard],
    data: { roles: ROLES_ADMISION },
    children: [
      {
        path: '',
        redirectTo: 'historias',
        pathMatch: 'full'
      },
      {
        path: 'historias',
        canActivate: [roleGuard],
        data: { roles: ROLES_ADMISION },
        loadComponent: () =>
          import('./features/admision/historias/admision-historias.component').then(
            m => m.AdmisionHistoriasComponent
          )
      },
      {
        path: 'emergencia',
        canActivate: [roleGuard],
        data: { roles: ['ADMINISTRADOR', 'JEFE_ENFERMERIA', 'ENFERMERO'] },
        loadComponent: () =>
          import('./features/admision/emergencia/admision-emergencia.component').then(
            m => m.AdmisionEmergenciaComponent
          )
      },
      {
        path: 'consulta',
        canActivate: [roleGuard],
        data: { roles: ROLES_ADMISION },
        loadComponent: () =>
          import('./features/admision/consulta/admision-consulta.component').then(
            m => m.AdmisionConsultaComponent
          )
      }
    ]
  },
  {
    path: 'atencion-medica',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'MEDICO'] },
    children: [
      {
        path: '',
        redirectTo: 'historial-clinico',
        pathMatch: 'full'
      },
      {
        path: 'historial-clinico',
        loadComponent: () =>
          import('./features/atencion-medica/historial-clinico/historial-clinico.component').then(
            m => m.HistorialClinicoComponent
          )
      },
      {
        path: 'registro-resultados',
        loadComponent: () =>
          import('./features/atencion-medica/registro-resultados/registro-resultados.component').then(
            m => m.RegistroResultadosComponent
          )
      },
      {
        path: 'receta-medica',
        loadComponent: () =>
          import('./features/atencion-medica/receta-medica/receta-medica.component').then(
            m => m.RecetaMedicaComponent
          )
      }
    ]
  },
  {
    path: 'farmacia',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'TECNICO_FARMACIA'] },
    children: [
        {
          path: 'despacho',
          loadComponent: () =>
            import('./features/farmacia/despacho/farmacia-despacho.component').then(m => m.FarmaciaDespachoComponent)
        },
        {
          path: 'inventario',
          loadComponent: () =>
            import('./features/farmacia/inventario/farmacia-inventario.component').then(m => m.FarmaciaInventarioComponent)
        },
        {
          path: 'stock-bajo',
          loadComponent: () =>
            import('./features/farmacia/stock-bajo/farmacia-stock-bajo.component').then(m => m.FarmaciaStockBajoComponent)
        }
    ]
  },
  {
    path: 'caja-facturacion',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'CAJERO'] },
    loadComponent: () =>
      import('./features/caja-facturacion/caja-facturacion.component').then(
        m => m.CajaFacturacionComponent
      )
  },
  {
    path: 'administracion',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR'] },
    children: [
      {
        path: '',
        redirectTo: 'trabajadores',
        pathMatch: 'full'
      },
      {
        path: 'trabajadores',
        loadComponent: () =>
          import('./features/administracion/administracion-trabajadores/administracion-trabajadores.component').then(
            m => m.AdministracionTrabajadoresComponent
          )
      },
      {
        path: 'horarios-medicos',
        loadComponent: () =>
          import('./features/administracion/horarios-medicos/horarios-medicos.component').then(
            m => m.HorariosMedicosComponent
          )
      },
      {
        path: 'series',
        loadComponent: () =>
          import('./features/administracion/series-comprobantes/series-comprobantes.component').then(
            m => m.SeriesComprobantesComponent
          )
      },
      {
        path: 'cajas',
        loadComponent: () =>
          import('./features/administracion/asignacion-cajas/asignacion-cajas.component').then(
            m => m.AsignacionCajasComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
