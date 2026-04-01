import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RecoveryComponent } from './auth/recovery/recovery.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { MyaccountComponent } from './pages/myaccount/myaccount.component';
import { PerfilComponent } from './pages/myaccount/perfil/perfil.component';
import { MisPagosComponent } from './pages/mis-pagos/mis-pagos.component';
import { MisFacturasComponent } from './pages/mis-facturas/mis-facturas.component';
import {AuthGuard} from './guards/auth.guard';
import { PropiedadDetalleComponent } from './pages/detalles/propiedad-detalle/propiedad-detalle.component';
import { ReportarPagoComponent } from './pages/reportar-pago/reportar-pago.component';
export const routes: Routes = [
    {
            path:'home',
            canActivate: [AuthGuard],
            component: HomeComponent
        },
        {
            path:'login',
            component: LoginComponent
        },
        {
            path:'registro',
            component: RegisterComponent
        },
        {path: 'recovery-password', component: RecoveryComponent },
        
        {path: 'mis-pagos', canActivate: [AuthGuard], component: MisPagosComponent },
        {path: 'mis-facturas', component: MisFacturasComponent },
        {path: 'my-account', canActivate: [AuthGuard], component: MyaccountComponent },
        {path: 'my-account/perfil/:id', component: PerfilComponent },

        { path: 'propiedad-detalle/:tipo/:id', component: PropiedadDetalleComponent },
        { path: 'reportar-pago/:id', component: ReportarPagoComponent },

        { path: '', redirectTo: '/home', pathMatch: 'full' },
          { path: '**', component: LoginComponent },

        
        
        
];
