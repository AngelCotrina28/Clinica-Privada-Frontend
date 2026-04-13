import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdmisionComponent } from './pages/admision/admision.component';
import { AtencionMedicaComponent } from './pages/atencion-medica/atencion-medica.component';
import { FarmaciaComponent } from './pages/farmacia/farmacia.component';
import { CajaFacturacionComponent } from './pages/caja-facturacion/caja-facturacion.component';
import { AdministracionComponent } from './pages/administracion/administracion.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'admision', component: AdmisionComponent },
  { path: 'atencion-medica', component: AtencionMedicaComponent },
  { path: 'farmacia', component: FarmaciaComponent },
  { path: 'caja-facturacion', component: CajaFacturacionComponent },
  { path: 'administracion', component: AdministracionComponent },
];