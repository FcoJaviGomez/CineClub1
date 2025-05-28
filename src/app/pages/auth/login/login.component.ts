import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { Router } from '@angular/router';

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

  mensajeLogin: string = '';
  errorLogin: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async iniciarSesion() {
    this.mensajeLogin = '';
    this.errorLogin = '';

    const { email, password } = this.usuario;

    // Validación rápida antes del login
    if (!email || !password) {
      this.errorLogin = 'Por favor, completa todos los campos.';
      return;
    }

    try {
      const { data, error } = await this.supabaseService.login(email, password);
      const { user, session } = data;

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          this.errorLogin = 'Debes confirmar tu correo electrónico antes de iniciar sesión.';
        } else {
          this.errorLogin = 'Error al iniciar sesión: ' + error.message;
        }
        return;
      }

      if (user && session) {
        this.mensajeLogin = '✅ ¡Inicio de sesión exitoso!';
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 3000);
      }

    } catch (err: any) {
      this.errorLogin = 'Ocurrió un error inesperado al iniciar sesión.';
      console.error(err);
    }
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }

  irARecuperar() {
  this.router.navigate(['/forgot-password']);
}
}
