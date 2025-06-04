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
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/(tabs)/perfil/perfil.component').then(m => m.PerfilComponent)
  },
  {
    path: 'email-confirm',
    loadComponent: () =>
      import('./pages/auth/email-confirm/email-confirm.component').then(m => m.EmailConfirmComponent)
  },
  {
    path: 'admin/usuarios',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/(tabs)/admin/usuarios.component').then(m => m.UsuariosComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'ranking',
    loadComponent: () => import('./pages/(tabs)/ranking/ranking.component').then(m => m.RankingComponent)
  },
  {
    path: 'favoritos',
    loadComponent: () => import('./pages/(tabs)/favoritos/favoritos.component').then(m => m.FavoritosComponent)
  },
  {
    path: 'comunidad',
    loadComponent: () =>
      import('./pages/(tabs)/comunidad/comunidad.component').then(m => m.ComunidadComponent)
  },
  {
    path: 'juego',
    loadComponent: () =>
      import('./pages/(tabs)/juego/juego.component').then(m => m.JuegoComponent)
  }
];