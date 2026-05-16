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
      { path: 'historias', loadComponent: () => import('./features/admision/historias/admision-historias.component').then(m => m.AdmisionHistoriasComponent) },
      { path: 'emergencia', canActivate: [roleGuard], data: { roles: ['ADMINISTRADOR', 'JEFE_ENFERMERIA'] }, loadComponent: () => import('./features/admision/emergencia/admision-emergencia.component').then(m => m.AdmisionEmergenciaComponent) },
      { path: 'consulta', loadComponent: () => import('./features/admision/consulta/admision-consulta.component').then(m => m.AdmisionConsultaComponent) },
    ]
  },
  {
    path: 'atencion-medica',
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
  {
    path: 'farmacia',
    canActivate: [roleGuard],
    data: { roles: ['ADMINISTRADOR', 'TECNICO_FARMACIA'] },
    loadComponent: () => import('./features/farmacia/farmacia.component').then(m => m.FarmaciaComponent)
  },
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