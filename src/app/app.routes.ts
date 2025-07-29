import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { ArchiveComponent } from './pages/archive/archive.component';
import { TrashComponent } from './pages/trash/trash.component';
import { AuthGuardService } from './services/authGuard_service/auth-guard.service';
import { NotesComponent } from './components/notes/notes.component';
import { RemindersComponent } from './pages/reminders/reminders.component';

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
    data: { title: 'Fundoonotes' },
    children: [
      { path: '', component: NotesComponent, data: { title: 'Fundoonotes' } },
      { path: 'reminders', component: RemindersComponent, data: { title: 'Reminders' } },
      { path: 'archive', component: ArchiveComponent, data: { title: 'Archive' } },
      { path: 'trash', component: TrashComponent, data: { title: 'Trash' } },
    ],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
