import { Component } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ResetPasswordComponent {
  nuevaPassword: string = '';
  confirmarPassword: string = '';
  mensaje: string = '';
  error: string = '';

  constructor(private supabaseService: SupabaseService, private router: Router) {
    this.verificarSesion();
  }

  sesionValida: boolean = false;

  async verificarSesion() {
    const { data, error } = await this.supabaseService.getUser();
    if (error || !data.user) {
      this.error = 'Sesión inválida o expirada. Intenta solicitar un nuevo enlace.';
      this.sesionValida = false;
    } else {
      this.sesionValida = true;
    }
  }

  async cambiarPassword() {
    this.mensaje = '';
    this.error = '';

    if (this.nuevaPassword.length < 8) {
      this.error = 'La contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    const { error } = await this.supabaseService.client.auth.updateUser({
      password: this.nuevaPassword
    });

    if (error) {
      this.error = 'Error al cambiar la contraseña: ' + error.message;
    } else {
      this.mensaje = '✅ Contraseña actualizada correctamente. Serás redirigido al login.';
      setTimeout(() => this.router.navigate(['/login']), 3000);
    }
  }

  volverLogin() {
    this.router.navigate(['/login']);
  }
}
