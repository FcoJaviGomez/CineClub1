import { Component } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ForgotPasswordComponent {
  email: string = '';
  mensaje: string = '';
  error: string = '';

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async enviarCorreo() {
    this.mensaje = '';
    this.error = '';

    if (!this.email.includes('@')) {
      this.error = 'Introduce un correo válido.';
      return;
    }

    const { error } = await this.supabaseService.resetPassword(this.email);

    if (error) {
      this.error = 'Error al enviar el correo: ' + error.message;
    } else {
      this.mensaje = '✅ Revisa tu correo para restablecer la contraseña.';
      setTimeout(() => {
        this.irALogin();
      }, 3000);
    }
  }

  irALogin() {
    this.router.navigate(['/login']);
  }
}
