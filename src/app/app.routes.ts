import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { ArchiveComponent } from './pages/archive/archive.component';
import { TrashComponent } from './pages/trash/trash.component';
import { AuthGuardService } from './services/authGuard_service/auth-guard.service';
import { NotesComponent } from './components/notes/notes.component';

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
    path: 'dashboard',
    component: HomeComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: '', component: NotesComponent },
      {
        path: 'archive',
        component: ArchiveComponent,
      },
      {
        path: 'trash',
        component: TrashComponent,
      },
    ],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];