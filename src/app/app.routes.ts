import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RecoveryComponent } from './auth/recovery/recovery.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { MyaccountComponent } from './pages/myaccount/myaccount.component';
import { PerfilComponent } from './pages/myaccount/perfil/perfil.component';

export const routes: Routes = [
    {
            path:'',
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
        {path: 'my-account', component: MyaccountComponent },
        {path: 'my-account/perfil/:id', component: PerfilComponent },
];
