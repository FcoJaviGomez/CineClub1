import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { MoviesService } from '../../../services/movies.service';
import { SupabaseService } from '../../../services/supabase.service';
import { Movie } from '../../../models/movie.model';

import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-detalle-pelicula',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SafeUrlPipe],
  templateUrl: './detalle-pelicula.component.html',
  styleUrls: ['./detalle-pelicula.component.css']
})
export class DetallePeliculaComponent implements OnInit {
  infoPelicula!: Movie;
  infoGenres: any[] = [];
  actores: any[] = [];
  cargando = true;

  favoritos: number[] = [];
  usuarioId: string | null = null;

  origen: string = '';

  // Reseñas
  resenas: any[] = [];
  puntuacionMedia: number | null = null;
  miResena: any = null;
  nuevaPuntuacion: number = 5;
  nuevoComentario: string = '';

  constructor(
    private route: ActivatedRoute,
    private moviesService: MoviesService,
    private supabaseService: SupabaseService,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.origen = params['origen'] || '';
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarFavoritosDelUsuario();
      this.cargarDetalles(id);
      this.cargarActores(id);
      this.cargarResenas(+id);
      this.cargarMiResena(+id);
    }
  }

  async agregarAFavoritos(pelicula: any) {
    if (!this.usuarioId) return;

    const tmdbId = pelicula.id;

    // 1. Verifica si ya es favorita
    if (this.esFavorita(tmdbId)) {
      alert('Ya tienes esta película en favoritos.');
      return;
    }

    // 2. Inserta o actualiza en la tabla 'peliculas' usando tmdb_id como clave única
    const peliculaInsert = {
      tmdb_id: tmdbId,
      titulo: pelicula.title || 'Sin título',
      poster_path: pelicula.poster_path || '',
      fecha_lanzamiento: pelicula.release_date || null
    };


    const { error: errorPelicula } = await this.supabaseService.client
      .from('peliculas')
      .upsert(peliculaInsert, { onConflict: 'tmdb_id' });

    if (errorPelicula) {
      console.error('❌ Error al guardar la película:', errorPelicula);
      alert('No se pudo guardar la película.');
      return;
    }

    // 3. Obtener el ID (uuid) real de la película recién insertada
    const { data: peliculaData, error: errorSelect } = await this.supabaseService.client
      .from('peliculas')
      .select('id')
      .eq('tmdb_id', tmdbId)
      .maybeSingle();

    if (errorSelect || !peliculaData) {
      console.error('❌ Error al obtener el ID de la película:', errorSelect);
      alert('No se pudo recuperar la película para agregar a favoritos.');
      return;
    }

    // 4. Insertar en la tabla 'favoritos'
    const { error: errorFavorito } = await this.supabaseService.client
      .from('favoritos')
      .insert({
        usuario_id: this.usuarioId,
        pelicula_id: peliculaData.id
      });

    if (errorFavorito) {
      if (errorFavorito.code === '23505') {
        console.warn('⚠️ Película ya en favoritos (conflicto).');
      } else {
        console.error('❌ Error al guardar favorito:', errorFavorito);
        alert('No se pudo agregar a favoritos');
        return;
      }
    }

    // 5. Agrega a la lista local de favoritos por tmdb_id
    this.favoritos.push(tmdbId);
  }

  esFavorita(id: number): boolean {
    return this.favoritos.includes(id);
  }

  async cargarFavoritosDelUsuario() {
    const { data: { user }, error: userError } = await this.supabaseService.getUser();
    if (!user || userError) return;

    const { data: perfil } = await this.supabaseService.client
      .from('usuarios')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    if (!perfil) return;
    this.usuarioId = perfil.id;

    // Hacemos join con la tabla de películas
    const { data: favoritos } = await this.supabaseService.client
      .from('favoritos')
      .select('peliculas!inner ( tmdb_id )') // forzamos el join
      .eq('usuario_id', perfil.id);

    this.favoritos = (favoritos || [])
      .map((f: any) => f.peliculas?.tmdb_id)
      .filter((id: any) => !!id);
  }

  async eliminarDeFavoritos(tmdbId: number) {
    const confirmado = window.confirm('¿Estás seguro de que deseas eliminar esta película de tus favoritos?');
    if (!confirmado) return;

    if (!this.usuarioId) return;

    const { data: pelicula } = await this.supabaseService.client
      .from('peliculas')
      .select('id')
      .eq('tmdb_id', tmdbId)
      .maybeSingle();

    if (!pelicula) return;

    const { error } = await this.supabaseService.client
      .from('favoritos')
      .delete()
      .match({
        usuario_id: this.usuarioId,
        pelicula_id: pelicula.id
      });

    if (!error) {
      this.favoritos = this.favoritos.filter(id => id !== tmdbId);
    } else {
      console.error('Error al eliminar de favoritos:', error);
      alert('No se pudo eliminar de favoritos.');
    }
  }

  cargarDetalles(id: string) {
    this.moviesService.getMovieDetails(id).subscribe({
      next: (data) => {
        this.infoPelicula = data;
        this.infoGenres = data.genres || [];
      },
      error: (err) => {
        console.error('Error al cargar detalles:', err);
      }
    });
  }

  cargarActores(id: string) {
    this.moviesService.getActores(id).subscribe({
      next: (response) => {
        this.actores = response.cast.slice(0, 12);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar actores desde Supabase Function', err);
        this.cargando = false;
      }
    });
  }

  async cargarResenas(tmdb_id: number) {
    const { data, error } = await this.supabaseService.client
      .from('reseñas')
      .select('comentario, puntuacion, usuario_id, creado_en')
      .eq('tmdb_id', tmdb_id);

    if (!error && data) {
      this.resenas = data;
      this.puntuacionMedia = this.calcularMedia(data);
    }
  }

  calcularMedia(resenas: any[]): number {
    const total = resenas.reduce((sum, r) => sum + r.puntuacion, 0);
    return Math.round((total / resenas.length) * 10) / 10;
  }

  async cargarMiResena(tmdb_id: number) {
    const { data: { user } } = await this.supabaseService.getUser();
    if (!user) return;

    const { data: perfil } = await this.supabaseService.client
      .from('usuarios')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    if (!perfil) return;

    const { data, error } = await this.supabaseService.client
      .from('reseñas')
      .select('*')
      .eq('tmdb_id', tmdb_id)
      .eq('usuario_id', perfil.id)
      .maybeSingle();

    if (!error && data) {
      this.miResena = data;
      this.nuevaPuntuacion = data.puntuacion;
      this.nuevoComentario = data.comentario;
    }
  }

  async enviarResena(tmdb_id: number) {
    const { data: { user } } = await this.supabaseService.getUser();
    if (!user) return;

    // Buscar perfil del usuario
    const { data: perfil } = await this.supabaseService.client
      .from('usuarios')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    if (!perfil) return;

    // Buscar la película en tu base de datos para obtener el id interno
    const { data: pelicula } = await this.supabaseService.client
      .from('peliculas')
      .select('id')
      .eq('tmdb_id', tmdb_id)
      .maybeSingle();

    if (!pelicula) {
      alert('Película no encontrada en la base de datos');
      return;
    }

    // Payload completo incluyendo pelicula_id
    const payload = {
      usuario_id: perfil.id,
      tmdb_id,
      pelicula_id: pelicula.id,
      comentario: this.nuevoComentario,
      puntuacion: this.nuevaPuntuacion
    };

    const { error } = await this.supabaseService.client
      .from('reseñas')
      .upsert([payload], { ignoreDuplicates: false })
      .select();

    if (!error) {
      await this.cargarResenas(tmdb_id);
      await this.cargarMiResena(tmdb_id);
      alert('Reseña enviada correctamente');
    } else {
      console.error('Error al enviar reseña:', error);
      alert('No se pudo guardar la reseña');
    }
  }

  mostrarTrailer = false;
  trailerUrl: string | null = null;

  async abrirTrailer() {
    if (!this.infoPelicula?.id) return;

    try {
      const { data, error } = await this.supabaseService.client.functions.invoke('rapid-handler', {
        body: { movie_id: this.infoPelicula.id }
      });

      if (error) {
        console.error('❌ Error al invocar rapid-handler:', error);
        this.trailerUrl = null;
        this.mostrarTrailer = true;
        return;
      }

      const videos = data?.results || [];

      // 1. Tráiler oficial
      let trailer = videos.find(
        (v: any) =>
          v.type === 'Trailer' &&
          v.site === 'YouTube' &&
          v.official === true
      );

      if (!trailer) {
        console.warn('ℹ️ Tráiler oficial no encontrado. Buscando tráiler no oficial...');
        trailer = videos.find(
          (v: any) =>
            v.type === 'Trailer' &&
            v.site === 'YouTube'
        );
      }

      // 2. Cualquier video de YouTube
      if (!trailer) {
        console.warn('⚠️ Ningún tráiler encontrado. Buscando cualquier video de YouTube...');
        trailer = videos.find((v: any) => v.site === 'YouTube');
      }

      if (trailer) {
        this.trailerUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
      } else {
        console.warn('❌ Ningún video disponible para esta película.');
        this.trailerUrl = null;
      }

      this.mostrarTrailer = true;
    } catch (err) {
      console.error('❌ Error general en abrirTrailer:', err);
      this.trailerUrl = null;
      this.mostrarTrailer = true;
    }
  }

  cerrarTrailer() {
    this.mostrarTrailer = false;
    this.trailerUrl = null;
  }

}