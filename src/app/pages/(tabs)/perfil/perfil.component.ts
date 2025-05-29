import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
  imports: [CommonModule, FormsModule, RouterModule]
})
export class PerfilComponent implements OnInit {
  usuario: any = null;
  cargando = true;
  favoritas: any[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      const { data, error: userError } = await this.supabaseService.getUser();
      const user = data?.user;

      if (userError || !user) {
        console.error('❌ Error al obtener el usuario autenticado:', userError);
        return;
      }
      console.log('✅ Usuario autenticado:', user.email);

      const { data: perfil, error } = await this.supabaseService.client
        .from('usuarios')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (perfil) {
        this.usuario = perfil;
        console.log('✅ Perfil encontrado:', perfil);
        await this.cargarFavoritas();
      } else {
        console.warn('⚠️ No se encontró el perfil para:', user.email);
      }

      if (error) {
        console.error('❌ Error al cargar el perfil:', error);
      }
    } catch (e) {
      console.error('❌ Error inesperado en ngOnInit:', e);
    } finally {
      this.cargando = false;
    }
  }

  async cargarFavoritas() {
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
    if (!usuarioId) {
      console.error('❌ No se pudo obtener el ID del usuario para cargar favoritas.');
      return;
    }

    const { data: favoritas, error } = await this.supabaseService.client
      .from('favoritos')
      .select('*')
      .eq('usuario_id', usuarioId);

    if (!error && favoritas) {
      this.favoritas = favoritas;
      console.log('✅ Favoritas cargadas:', favoritas);
    } else {
      console.error('❌ Error al cargar favoritas:', error);
    }
  }

  async eliminarFavorito(tmdb_id: number) {
    console.log('🗑 Intentando eliminar favorito con tmdb_id:', tmdb_id);

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
    if (!usuarioId) {
      console.error('❌ No se pudo obtener el ID del usuario para borrar favorito.');
      return;
    }

    const { error } = await this.supabaseService.client
      .from('favoritos')
      .delete()
      .eq('usuario_id', usuarioId)
      .eq('tmdb_id', tmdb_id);

    if (error) {
      console.error('❌ Error al eliminar favorito desde perfil:', error);
    } else {
      this.favoritas = this.favoritas.filter(f => f.tmdb_id !== tmdb_id);
      console.log(`✅ Favorito con tmdb_id ${tmdb_id} eliminado correctamente`);
    }
  }

  async guardarCambios() {
    try {
      const { error } = await this.supabaseService.client
        .from('usuarios')
        .update({
          nombre: this.usuario.nombre,
          apellidos: this.usuario.apellidos,
        })
        .eq('id', this.usuario.id);

      if (error) {
        console.error('❌ Error al guardar perfil:', error);
        alert('Error al guardar los cambios.');
      } else {
        alert('Cambios guardados con éxito.');
      }
    } catch (e) {
      console.error('❌ Excepción al guardar cambios:', e);
    }
  }

  async cerrarSesion() {
    await this.supabaseService.logout();
    this.router.navigate(['/login']);
  }

  // ✅ Nuevo método para navegar a detalles con queryParam origen=perfil
  irADetalle(tmdb_id: number) {
    this.router.navigate(['/detalle-pelicula', tmdb_id], {
      queryParams: { origen: 'perfil' }
    });
  }
}
