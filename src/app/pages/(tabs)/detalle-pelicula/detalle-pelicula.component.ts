import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MoviesService } from '../../../services/movies.service';
import { Movie } from '../../../models/movie.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-detalle-pelicula',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detalle-pelicula.component.html',
  styleUrls: ['./detalle-pelicula.component.css']
})
export class DetallePeliculaComponent implements OnInit {
  infoPelicula!: Movie;
  infoGenres: any[] = [];
  actores: any[] = [];
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private moviesService: MoviesService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Detalles de la película
      this.moviesService.getMovieDetails(id).subscribe({
        next: (data) => {
          console.log('Detalles completos de la película:', data);
          this.infoPelicula = data;
          this.infoGenres = data.genres || [];
        },
        error: (err) => {
          console.error('Error al cargar detalles:', err);
        }
      });

      // Cast de la película (actores)
      const url = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${environment.tmdbApiKey}&language=es-ES`;
      this.http.get<any>(url).subscribe({
        next: (response) => {
          this.actores = response.cast.slice(0, 12); // Mostrar primeros 12
          this.cargando = false;
        },
        error: (err) => {
          console.error('Error al cargar actores:', err);
          this.cargando = false;
        }
      });
    }
  }

}
