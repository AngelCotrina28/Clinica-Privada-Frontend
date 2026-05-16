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

  // Inicio — todos los roles autenticados llegan aquí
  {
    path: 'dashboard',
    canActivate: [roleGuard],
    data: {
      roles: [
        'ADMINISTRADOR',
        'JEFE_ENFERMERIA',
        'ENFERMERO',
        'RECEPCIONISTA',
        'MEDICO',
        'TECNICO_FARMACIA',
        'CAJERO'
      ]
    },
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // Admisión y consultas
  // Roles con acceso parcial distinto por subsección — el guard del padre
  // sólo verifica que el rol pertenezca a esta sección en general.
  {
    path: 'admision',
    canActivate: [roleGuard],
    data: {
      roles: ['JEFE_ENFERMERIA', 'ENFERMERO', 'RECEPCIONISTA']
    },
    children: [
      {
        path: '',
        redirectTo: 'historias',
        pathMatch: 'full'
      },

      // Gestión de historias — los 3 roles de admisión la necesitan
      {
        path: 'historias',
        canActivate: [roleGuard],
        data: {
          roles: ['JEFE_ENFERMERIA', 'ENFERMERO', 'RECEPCIONISTA']
        },
        loadComponent: () =>
          import('./features/admision/historias/admision-historias.component').then(
            m => m.AdmisionHistoriasComponent
          )
      },

      // Flujo de emergencia — jefa (acceso total) y enfermera (sin estado de cuenta)
      // El control fino de estado de cuenta se maneja a nivel de componente/permisos
      {
        path: 'emergencia',
        canActivate: [roleGuard],
        data: {
          roles: ['JEFE_ENFERMERIA', 'ENFERMERO']
        },
        loadComponent: () =>
          import('./features/admision/emergencia/admision-emergencia.component').then(
            m => m.AdmisionEmergenciaComponent
          )
      },

      // Consulta externa — exclusivo de recepcionista
      {
        path: 'consulta',
        canActivate: [roleGuard],
        data: {
          roles: ['RECEPCIONISTA']
        },
        loadComponent: () =>
          import('./features/admision/consulta/admision-consulta.component').then(
            m => m.AdmisionConsultaComponent
          )
      }
    ]
  },

  // Atención médica — exclusivo del médico
  // No incluye ADMINISTRADOR: el admin no opera esta sección
  {
    path: 'atencion-medica',
    canActivate: [roleGuard],
    data: {
      roles: ['MEDICO']
    },
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

  // Farmacia — exclusivo del técnico de farmacia
  // No incluye ADMINISTRADOR: el admin no opera esta sección
  {
    path: 'farmacia',
    canActivate: [roleGuard],
    data: {
      roles: ['TECNICO_FARMACIA']
    },
    loadComponent: () =>
      import('./features/farmacia/farmacia.component').then(m => m.FarmaciaComponent)
  },

  // Caja y facturación — cajero (apertura, cobro, cuadre) y admin (cierre, anulación)
  // Ambos entran; el control de qué opciones ve cada uno va en el componente
  {
    path: 'caja-facturacion',
    canActivate: [roleGuard],
    data: {
      roles: ['ADMINISTRADOR', 'CAJERO']
    },
    loadComponent: () =>
      import('./features/caja-facturacion/caja-facturacion.component').then(
        m => m.CajaFacturacionComponent
      )
  },

  // Administración — exclusivo del administrador
  {
    path: 'administracion',
    canActivate: [roleGuard],
    data: {
      roles: ['ADMINISTRADOR']
    },
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