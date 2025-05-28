import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) { }

  async ngOnInit() {
    this.esAdmin = await this.supabaseService.esAdmin();
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

  cerrarSesion(): void {
    localStorage.removeItem('token');
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }
}
