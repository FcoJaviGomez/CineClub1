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
  imagenPreview: string = 'assets/sin-foto.png';
  nuevaImagen!: File;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) { }

  async ngOnInit() {
    try {
      const { data, error: userError } = await this.supabaseService.getUser();
      const user = data?.user;

      if (userError || !user) {
        console.error('❌ Error al obtener el usuario autenticado:', userError);
        return;
      }

      const { data: perfil, error } = await this.supabaseService.client
        .from('usuarios')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (perfil) {
        this.usuario = perfil;
        this.imagenPreview = perfil.imagen_url || 'assets/sin-foto.png';
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
    if (!usuarioId) return;

    const { data: favoritas, error } = await this.supabaseService.client
      .from('favoritos')
      .select('*')
      .eq('usuario_id', usuarioId);

    if (!error && favoritas) {
      this.favoritas = favoritas;
    }
  }

  async guardarCambios() {
    try {
      let nuevaUrl = this.usuario.imagen_url;

      if (this.nuevaImagen) {
        const nombreArchivo = `${this.usuario.id}-${Date.now()}.${this.nuevaImagen.name.split('.').pop()}`;

        const { error: uploadError } = await this.supabaseService.client.storage
          .from('foto-perfil')
          .upload(nombreArchivo, this.nuevaImagen, { upsert: true });

        if (uploadError) {
          console.error('❌ Error al subir la imagen:', uploadError);
          alert('No se pudo subir la imagen de perfil.');
          return;
        }

        const { data } = this.supabaseService.client.storage
          .from('foto-perfil')
          .getPublicUrl(nombreArchivo);

        nuevaUrl = data.publicUrl;
      }

      const { error } = await this.supabaseService.client
        .from('usuarios')
        .update({
          nombre: this.usuario.nombre,
          apellidos: this.usuario.apellidos,
          imagen_url: nuevaUrl
        })
        .eq('id', this.usuario.id);

      if (error) {
        console.error('❌ Error al guardar perfil:', error);
        alert('Error al guardar los cambios.');
      } else {
        this.imagenPreview = nuevaUrl || 'assets/sin-foto.png';
        alert('Cambios guardados con éxito.');
      }
    } catch (e) {
      console.error('❌ Excepción al guardar cambios:', e);
    }
  }

  capturarImagen(event: any) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    this.nuevaImagen = archivo;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result as string;
    };
    reader.readAsDataURL(archivo);
  }

  async cerrarSesion() {
    await this.supabaseService.logout();
    this.router.navigate(['/login']);
  }

  irADetalle(tmdb_id: number) {
    this.router.navigate(['/detalle-pelicula', tmdb_id], {
      queryParams: { origen: 'perfil' }
    });
  }

  async eliminarFavorito(tmdb_id: number) {
    const { data, error: userError } = await this.supabaseService.getUser();
    const user = data?.user;

    if (!user || userError) return;

    const { data: perfil } = await this.supabaseService.client
      .from('usuarios')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    const usuarioId = perfil?.id;
    if (!usuarioId) return;

    const { error } = await this.supabaseService.client
      .from('favoritos')
      .delete()
      .eq('usuario_id', usuarioId)
      .eq('tmdb_id', tmdb_id);

    if (!error) {
      this.favoritas = this.favoritas.filter(f => f.tmdb_id !== tmdb_id);
    }
  }
}
