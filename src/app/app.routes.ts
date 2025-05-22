import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/(tabs)/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'detalle-pelicula/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/(tabs)/detalle-pelicula/detalle-pelicula.component').then(m => m.DetallePeliculaComponent)
  },
  {
    path: 'email-confirm',
    loadComponent: () =>
      import('./pages/auth/email-confirm/email-confirm.component').then(m => m.EmailConfirmComponent)
  }
];
