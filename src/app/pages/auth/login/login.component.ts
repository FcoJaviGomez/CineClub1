import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  usuario = {
    email: '',
    password: ''
  };

  validacion: [string, boolean] = ['', true];

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) { }

async iniciarSesion() {
  const { email, password } = this.usuario;

  try {
    const { data, error } = await this.supabaseService.login(email, password);

    if (error) {
      console.error('Error al iniciar sesión:', error.message);
      this.validacion = [error.message, false];
      return;
    }

    const user = data?.user;

    // ⚠️ Verifica si el correo fue confirmado
    if (!user?.email_confirmed_at) {
      this.validacion = ['Debes confirmar tu correo antes de iniciar sesión.', false];
      return;
    }

    // ✅ Si todo está bien, continúa al home
    this.router.navigate(['/home']);

  } catch (error) {
    console.error('Error inesperado al iniciar sesión:', error);
    this.validacion = ['Error inesperado al iniciar sesión', false];
  }
}


  irARegistro() {
    this.router.navigate(['/registro']);
  }
}