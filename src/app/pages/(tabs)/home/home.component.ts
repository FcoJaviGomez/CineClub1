import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { MoviesService } from '../../../services/movies.service';
import { SupabaseService } from '../../../services/supabase.service';
import { Movie } from '../../../models/movie.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  peliculasPopulares: Movie[] = [];
  peliculasActuales: Movie[] = [];
  cargando = true;

  favoritos: number[] = [];
  usuarioId: string | null = null;

  // Géneros
  generos: any[] = [];
  generosFiltrados: any[] = [];
  filtroGenero: string = '';
  generoSeleccionado: string = '';

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(
    private moviesService: MoviesService,
    private supabaseService: SupabaseService,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    await this.obtenerUsuarioId();
    await this.cargarFavoritos();
    this.cargarPeliculas();
    this.cargarGeneros();
  }

  ngAfterViewInit() {
    this.activarScrollConArrastre(this.scrollContainer.nativeElement);
  }

  cargarPeliculas() {
    this.cargando = true;
    this.moviesService.getPopularMovies().subscribe({
      next: (response) => {
        this.peliculasActuales = response.results.slice(0, 6);
        this.peliculasPopulares = response.results.slice(6);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar películas', err);
        this.cargando = false;
      }
    });
  }

  async obtenerUsuarioId() {
    const { data: { user } } = await this.supabaseService.getUser();
    if (!user) return;

    const { data: perfil } = await this.supabaseService.client
      .from('usuarios')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    this.usuarioId = perfil?.id || null;
  }

  async cargarFavoritos() {
    if (!this.usuarioId) return;

    const { data, error } = await this.supabaseService.client
      .from('favoritos')
      .select('tmdb_id')
      .eq('usuario_id', this.usuarioId);

    if (!error && data) {
      this.favoritos = data.map(f => f.tmdb_id);
    }
  }

  esFavorita(id: number): boolean {
    return this.favoritos.includes(id);
  }

  async agregarAFavoritos(pelicula: any) {
    if (!this.usuarioId) return;

    const id = pelicula.id;
    if (this.esFavorita(id)) {
      alert('Ya tienes esta película en favoritos.');
      return;
    }

    const { error } = await this.supabaseService.client
      .from('favoritos')
      .insert({
        usuario_id: this.usuarioId,
        tmdb_id: id,
        titulo: pelicula.title,
        poster_path: pelicula.poster_path,
        fecha_lanzamiento: pelicula.release_date
      });

    if (error) {
      if (error.code === '23505') {
        console.warn('Película ya en favoritos (conflicto).');
        this.favoritos.push(id);
      } else {
        console.error('Error al guardar favorito', error);
        alert('No se pudo agregar a favoritos');
      }
    } else {
      this.favoritos.push(id);
    }
  }

  // ----------- FILTRO POR GÉNERO -------------

cargarGeneros() {
  this.moviesService.getGenres().subscribe({
    next: (res) => {
      console.log('✅ Géneros recibidos desde Supabase:', res); // ← Aquí va el log
      this.generos = res.genres;
      this.generosFiltrados = res.genres;
    },
    error: (err) => {
      console.error('❌ Error al cargar géneros', err);
    }
  });
}


 filtrarPeliculasPorGenero() {
  if (!this.generoSeleccionado) {
    this.cargarPeliculas();
    return;
  }

  this.cargando = true;
  this.moviesService.getMoviesByGenre(this.generoSeleccionado).subscribe({
    next: (res) => {
      this.peliculasPopulares = res.results;
      this.cargando = false;
    },
    error: (err) => {
      console.error('Error al filtrar por género', err);
      this.cargando = false;
    }
  });
}

  // --------- SCROLL INTERACTIVO ---------
  activarScrollConArrastre(element: HTMLElement) {
    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    element.addEventListener('mousedown', (e) => {
      isDown = true;
      element.classList.add('active');
      startX = e.pageX - element.offsetLeft;
      scrollLeft = element.scrollLeft;
    });

    element.addEventListener('mouseleave', () => {
      isDown = false;
      element.classList.remove('active');
    });

    element.addEventListener('mouseup', () => {
      isDown = false;
      element.classList.remove('active');
    });

    element.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const walk = (x - startX) * 1.5;
      element.scrollLeft = scrollLeft - walk;
    });
  }
}
