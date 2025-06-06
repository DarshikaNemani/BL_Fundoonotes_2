import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { ArchiveComponent } from './pages/archive/archive.component';
import { TrashComponent } from './pages/trash/trash.component';
import { AuthGuardService } from './services/authGuard_service/auth-guard.service';

export const routes: Routes = [
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'notes',
    component: HomeComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'archive',
    component: ArchiveComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'trash',
    component: TrashComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: '',
    redirectTo: '/notes',
    pathMatch: 'full'
  },
];
