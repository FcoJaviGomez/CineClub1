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

  // 1. Registro en Supabase Auth
  const { data, error } = await this.supabaseService.register(email, password);

  if (error) {
    this.errorRegistro = 'Error al crear la cuenta: ' + error.message;
    return;
  }

  const user = data?.user;

  if (!user) {
    this.errorRegistro = 'No se pudo crear el usuario en Auth.';
    return;
  }

  // 2. Guardar en la tabla usuarios
  const { error: insertError } = await this.supabaseService.insertUsuario({
    user_id: user.id,
    email: email.toLowerCase(),
    nombre,
    apellidos,
    fecha_nacimiento,
    created_at: new Date().toISOString(),
    rol: 'user'
  });

  if (insertError) {
    this.errorRegistro = 'Error al guardar los datos del usuario.';
    console.error(insertError);
    return;
  }

  // 3. Mostrar mensaje de confirmación
  this.mensajeRegistro = '✅ ¡Registro exitoso! Dirígete a tu correo electrónico para confirmar tu cuenta.';

  // 4. Redirigir al login después de unos segundos (opcional)
  setTimeout(() => {
    this.router.navigate(['/login']);
  }, 5000);
}


  irALogin() {
    this.router.navigate(['/login']);
  }
}
