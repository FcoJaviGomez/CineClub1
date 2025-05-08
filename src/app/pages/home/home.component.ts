import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule]
})
export class HomeComponent implements OnInit {
  userData: any = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) { }

  async ngOnInit() {
    try {
      const { data, error } = await this.supabaseService.getUser();

      if (error || !data?.user) {
        console.error('No hay usuario autenticado, redirigiendo al login.');
        this.router.navigate(['/login']);
        return;
      }

      // Guardamos los datos del usuario
      this.userData = {
        email: data.user.email,
        nombre: data.user.user_metadata?.['nombre'] || '',
        apellidos: data.user.user_metadata?.['apellidos'] || '',
        fecha_nacimiento: data.user.user_metadata?.['fecha_nacimiento'] || ''
      };


      console.log('Usuario cargado:', this.userData);

    } catch (error) {
      console.error('Error inesperado al cargar el usuario:', error);
      this.router.navigate(['/login']);
    }
  }
}
