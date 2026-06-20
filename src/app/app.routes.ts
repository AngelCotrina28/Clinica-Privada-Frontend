import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import {
  ROLE,
  ROLES_ADMISION,
  ROLES_ATENCION_MEDICA,
  ROLES_CAJA,
  ROLES_FARMACIA,
  ROLES_TODOS,
  SOLO_ADMINISTRADOR
} from './core/constants/roles';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
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
        redirectTo: 'consulta',
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
        data: { roles: [ROLE.ADMINISTRADOR, ROLE.JEFE_ENFERMERIA, ROLE.ENFERMERO] },
        loadComponent: () =>
          import('./features/admision/emergencia/admision-emergencia.component').then(
            m => m.AdmisionEmergenciaComponent
          )
      },
      {
        path: 'auditoria-ordenes',
        canActivate: [roleGuard],
        data: { roles: [ROLE.ADMINISTRADOR, ROLE.JEFE_ENFERMERIA] },
        loadComponent: () =>
          import('./features/admision/auditoria-ordenes/admision-auditoria-ordenes.component').then(
            m => m.AdmisionAuditoriaOrdenesComponent
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
    data: { roles: ROLES_ATENCION_MEDICA },
    loadComponent: () =>
      import('./features/atencion-medica/atencion-medica.component').then(
        m => m.AtencionMedicaComponent
      ),
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
      }
    ]
  },
  {
    path: 'farmacia',
    canActivate: [roleGuard],
    data: { roles: ROLES_FARMACIA },
    children: [
      {
        path: '',
        redirectTo: 'despacho',
        pathMatch: 'full'
      },
      {
        path: 'despacho',
        canActivate: [roleGuard],
        data: { roles: ROLES_FARMACIA },
        loadComponent: () =>
          import('./features/farmacia/despacho/farmacia-despacho.component').then(m => m.FarmaciaDespachoComponent)
      },
      {
        path: 'inventario',
        canActivate: [roleGuard],
        data: { roles: SOLO_ADMINISTRADOR },
        loadComponent: () =>
          import('./features/farmacia/inventario/farmacia-inventario.component').then(m => m.FarmaciaInventarioComponent)
      },
      {
        path: 'stock-bajo',
        canActivate: [roleGuard],
        data: { roles: ROLES_FARMACIA },
        loadComponent: () =>
          import('./features/farmacia/stock-bajo/farmacia-stock-bajo.component').then(m => m.FarmaciaStockBajoComponent)
      }
    ]
  },
  {
    path: 'caja-facturacion',
    canActivate: [roleGuard],
    data: { roles: ROLES_CAJA },
    loadComponent: () =>
      import('./features/caja-facturacion/caja-facturacion.component').then(
        m => m.CajaFacturacionComponent
      )
  },
  {
    path: 'administracion',
    canActivate: [roleGuard],
    data: { roles: SOLO_ADMINISTRADOR },
    children: [
      {
        path: '',
        redirectTo: 'trabajadores',
        pathMatch: 'full'
      },
      {
        path: 'trabajadores',
        canActivate: [roleGuard],
        data: { roles: SOLO_ADMINISTRADOR },
        loadComponent: () =>
          import('./features/administracion/administracion-trabajadores/administracion-trabajadores.component').then(
            m => m.AdministracionTrabajadoresComponent
          )
      },
      {
        path: 'horarios-medicos',
        canActivate: [roleGuard],
        data: { roles: SOLO_ADMINISTRADOR },
        loadComponent: () =>
          import('./features/administracion/horarios-medicos/horarios-medicos.component').then(
            m => m.HorariosMedicosComponent
          )
      },
      {
        path: 'consultorios',
        canActivate: [roleGuard],
        data: { roles: SOLO_ADMINISTRADOR },
        loadComponent: () =>
          import('./features/administracion/consultorios/consultorios.component').then(
            m => m.ConsultoriosComponent
          )
      },
      {
        path: 'series',
        canActivate: [roleGuard],
        data: { roles: SOLO_ADMINISTRADOR },
        loadComponent: () =>
          import('./features/administracion/series-comprobantes/series-comprobantes.component').then(
            m => m.SeriesComprobantesComponent
          )
      },
      {
        path: 'cajas',
        canActivate: [roleGuard],
        data: { roles: SOLO_ADMINISTRADOR },
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
