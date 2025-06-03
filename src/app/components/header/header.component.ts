import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  menuAbierto = false;
  esAdmin = false;

  imagenPerfil: string = 'assets/sin-foto.png';
  nombreUsuario: string = '';

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) { }

  ngOnInit() {
    this.cargarUsuario();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.cargarUsuario();
      }
    });
  }

  async cargarUsuario() {
    const { data, error } = await this.supabaseService.getUser();
    const user = data?.user;

    if (error || !user) {
      console.warn('No se pudo cargar usuario:', error);
      return;
    }

    const { data: perfil } = await this.supabaseService.client
      .from('usuarios')
      .select('nombre, imagen_url, rol')
      .eq('email', user.email)
      .maybeSingle();

    if (perfil) {
      this.nombreUsuario = perfil.nombre || 'Mi Perfil';
      this.imagenPerfil = perfil.imagen_url || 'assets/sin-foto.png';
      this.esAdmin = perfil.rol === 'admin';
    } else {
      this.esAdmin = false;
    }
  }

  irHome(): void {
    this.router.navigate(['/home']);
  }

  verPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  gestionarUsuarios(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  verFavoritos(): void {
    this.router.navigate(['/favoritos']);
  }

  verRanking(): void {
    this.router.navigate(['/ranking']);
  }

  verComunidad(): void {
    this.router.navigate(['/comunidad']);
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }
}
