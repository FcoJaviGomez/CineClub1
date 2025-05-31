import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MoviesService } from '../../../services/movies.service';
import { SupabaseService } from '../../../services/supabase.service';
import { Movie } from '../../../models/movie.model';
import { HttpClient } from '@angular/common/http';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detalle-pelicula',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './detalle-pelicula.component.html',
  styleUrls: ['./detalle-pelicula.component.css']
})
export class DetallePeliculaComponent implements OnInit {
  infoPelicula!: Movie;
  infoGenres: any[] = [];
  actores: any[] = [];
  cargando = true;

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
      this.cargarDetalles(id);
      this.cargarActores(id);
      this.cargarResenas(+id);
      this.cargarMiResena(+id);
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

    const { data: perfil } = await this.supabaseService.client
      .from('usuarios')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    if (!perfil) return;

    const payload = {
      usuario_id: perfil.id,
      tmdb_id,
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
}
