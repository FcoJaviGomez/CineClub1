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
    const { nombre, apellidos, email, password, fecha_nacimiento } = this.nuevoUsuario;

    try {
      // Registro en Supabase Auth con metadatos
      const { data, error } = await this.supabaseService.register(email, password, {
        nombre,
        apellidos,
        fecha_nacimiento
      });

      if (error) {
        console.error('Error al registrarse en auth:', error.message);
        this.errorRegistro = 'Ocurrió un error al registrarse: ' + error.message;
        return;
      }

      // Mostrar mensaje de éxito
      this.mensajeRegistro = 'Te has registrado correctamente. Revisa tu correo para confirmar tu cuenta.';
      this.errorRegistro = '';

      // redirigir después de unos segundos
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 6000);

    } catch (error) {
      console.error('Error inesperado en el registro:', error);
      this.errorRegistro = 'Ocurrió un error inesperado. Intenta de nuevo.';
    }
  }

  irALogin() {
    this.router.navigate(['/login']);
  }
}
