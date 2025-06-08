import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { MoviesService } from '../../../services/movies.service';
import { SupabaseService } from '../../../services/supabase.service';
import { Movie } from '../../../models/movie.model';
import { Router } from '@angular/router';


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
  busqueda: string = '';
  peliculasSugeridas: any[] = [];
  cargando = true;
  Math = Math;
  favoritos: number[] = [];
  usuarioId: string | null = null;

  // Géneros
  generos: any[] = [];
  generosFiltrados: any[] = [];
  filtroGenero: string = '';
  generoSeleccionado: string = '';

  @ViewChild('scrollContainerRef', { static: true }) scrollContainer!: ElementRef;

  ngAfterViewInit(): void {
    this.iniciarAutoScroll();
  }

  iniciarAutoScroll() {
    const container = this.scrollContainer.nativeElement;
    let scrollAmount = 0;

    setInterval(() => {
      scrollAmount += 1;
      if (scrollAmount >= container.scrollWidth - container.clientWidth) {
        scrollAmount = 0;
      }
      container.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }, 50); // velocidad ajustable
  }

  constructor(
    private moviesService: MoviesService,
    private supabaseService: SupabaseService,
    private http: HttpClient,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.obtenerUsuarioId();
    await this.cargarFavoritos();
    this.cargarPeliculas();
    this.cargarGeneros();
  }

  buscarPeliculasPorNombre() {
    if (this.busqueda.length < 2) {
      this.peliculasSugeridas = [];
      return;
    }

    this.moviesService.buscarPeliculasPorNombre(this.busqueda).subscribe({
      next: (res) => {
        this.peliculasSugeridas = res.results.slice(0, 5); // Limita sugerencias
      },
      error: (err) => console.error('Error en búsqueda de películas', err)
    });
  }

  irADetalle(id: number) {
    this.peliculasSugeridas = [];
    this.busqueda = '';
    this.router.navigate(['/detalle-pelicula', id]);
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
    this.usuarioId = user?.id || null;
  }

  async cargarFavoritos() {
    if (!this.usuarioId) return;

    const { data, error } = await this.supabaseService.client
      .from('favoritos')
      .select('peliculas(tmdb_id)')
      .eq('usuario_id', this.usuarioId);

    if (error) {
      console.error('❌ Error al cargar favoritos:', error);
      return;
    }

    this.favoritos = data
      .map((f: any) => f.peliculas?.tmdb_id)
      .filter((id: number | null) => id !== null);
  }

  // ----------- FILTRO POR GÉNERO -------------

  cargarGeneros() {
    this.moviesService.getGenres().subscribe({
      next: (res) => {
        this.generos = res.genres;
        this.generosFiltrados = res.genres;
      },
      error: (err) => {
        console.error('Error al cargar géneros', err);
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
