import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, FormsModule]
})
export class RegisterComponent {
  nuevoUsuario = {
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    fecha_nacimiento: ''
  };

  mensajeRegistro: string = '';
  errorRegistro: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async registrarse() {
    this.errorRegistro = '';
    this.mensajeRegistro = '';

    const { nombre, apellidos, email, password, fecha_nacimiento } = this.nuevoUsuario;

    // Validación simple
    if (!nombre || !apellidos || !email || !password || !fecha_nacimiento) {
      this.errorRegistro = 'Por favor, completa todos los campos.';
      return;
    }

    const { data, error } = await this.supabaseService.register(
      email,
      password,
      {
        nombre,
        apellidos,
        fecha_nacimiento,
      }
    );

    if (error) {
      this.errorRegistro = 'Error al crear la cuenta: ' + error.message;
      console.error(error);
      return;
    }

    this.mensajeRegistro = '✅ ¡Registro exitoso! Revisa tu correo electrónico para confirmar tu cuenta.';

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 5000);
  }

  irALogin() {
    this.router.navigate(['/login']);
  }
}
