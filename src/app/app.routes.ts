import { Routes } from '@angular/router';
import { guestGuard } from './notes/guest.guard';
import { AuthGuard } from './notes/auth.guard';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'notes',
    loadComponent: () =>
      import('./notes/notes.component').then((m) => m.NotesComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'notes/create',
    loadComponent: () =>
      import('./notes/create/create.component').then((m) => m.CreateComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'notes/update/:id',
    loadComponent: () =>
      import('./notes/update/update.component').then((m) => m.UpdateComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'notes/show/:id',
    loadComponent: () =>
      import('./notes/view/view.component').then((m) => m.ViewComponent),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
