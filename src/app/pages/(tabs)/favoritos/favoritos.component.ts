import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../services/supabase.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class FavoritosComponent implements OnInit {
  favoritas: any[] = [];

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async ngOnInit() {
    await this.cargarFavoritas();
  }

  async cargarFavoritas() {
    const { data, error: userError } = await this.supabaseService.getUser();
    const user = data?.user;

    if (!user || userError) {
      console.error('❌ Usuario no autenticado');
      return;
    }

    // Obtener el id del usuario registrado en la tabla "usuarios"
    const { data: perfil } = await this.supabaseService.client
      .from('usuarios')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    const usuarioId = perfil?.id;
    if (!usuarioId) {
      console.warn('⚠️ No se encontró el perfil del usuario');
      return;
    }

    // Hacer join con la tabla "peliculas"
    const { data: favoritas, error } = await this.supabaseService.client
      .from('favoritos')
      .select(`
        pelicula_id,
        peliculas (
          id,
          titulo,
          poster_path,
          tmdb_id
        )
      `)
      .eq('usuario_id', usuarioId);

    if (!error && favoritas) {
      // Extraer solo los datos de las películas
      this.favoritas = favoritas.map(f => f.peliculas);
    } else {
      console.error('❌ Error al cargar favoritas', error);
    }
  }

  async eliminarFavorito(tmdbId: number) {
    const confirmado = window.confirm('¿Estás seguro de que deseas eliminar esta película de tus favoritos?');
    if (!confirmado) return;

    const { data, error: userError } = await this.supabaseService.getUser();
    const user = data?.user;

    if (!user || userError) {
      console.error('❌ Usuario no autenticado');
      return;
    }

    const { data: perfil } = await this.supabaseService.client
      .from('usuarios')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    const usuarioId = perfil?.id;
    if (!usuarioId) return;

    const { data: peli } = await this.supabaseService.client
      .from('peliculas')
      .select('id')
      .eq('tmdb_id', tmdbId)
      .maybeSingle();

    if (!peli) return;

    const { error } = await this.supabaseService.client
      .from('favoritos')
      .delete()
      .match({ usuario_id: usuarioId, pelicula_id: peli.id });

    if (!error) {
      this.favoritas = this.favoritas.filter(p => p.tmdb_id !== tmdbId);
      alert('✅ Película eliminada de favoritos');
    } else {
      console.error('❌ Error al eliminar favorito', error);
      alert('❌ Ocurrió un error al eliminar la película');
    }
  }


    irADetalle(tmdb_id: number) {
    this.router.navigate(['/detalle-pelicula', tmdb_id], {
      queryParams: { origen: 'perfil' }
    });
  }

}

