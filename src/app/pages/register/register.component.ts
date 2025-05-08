import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
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

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) { }

  async registrarse() {
    const { nombre, apellidos, email, password, fecha_nacimiento } = this.nuevoUsuario;

    try {
      // Registro en auth
      const { data, error } = await this.supabaseService.register(email, password, {
        nombre,
        apellidos,
        fecha_nacimiento
      });

      if (error) {
        console.error('Error al registrarse en auth:', error.message);
        return;
      }

      console.log('Usuario creado en auth:', data);

      // Insertamos en la tabla 'usuarios'
      const { error: insertError } = await this.supabaseService.insertUsuario({
        email: email,
        nombre: nombre,
        apellidos: apellidos,
        fecha_nacimiento: fecha_nacimiento,
        password_hash: '', // Opcionalmente podrías guardar hash aquí si quieres
        last_login: null,
        created_at: new Date().toISOString()
      });

      if (insertError) {
        console.error('Error insertando en tabla usuarios:', insertError.message);
        return;
      }

      console.log('Usuario insertado en tabla usuarios.');

      // Redirigir al login
      this.router.navigate(['/login']);

    } catch (error) {
      console.error('Error inesperado en el registro:', error);
    }
  }
  irALogin() {
    this.router.navigate(['/login']);
  }
}
