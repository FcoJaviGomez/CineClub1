import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Movie, MovieResponse } from '../models/movie.model';

@Injectable({
  providedIn: 'root'
})
export class MoviesService {

  private baseUrl = 'https://api.themoviedb.org/3/movie';
  private apiKey = environment.tmdbApiKey;
  private language = 'es-ES';

  constructor(private http: HttpClient) {}

  getPopularMovies(): Observable<MovieResponse> {
    const url = `${this.baseUrl}/popular?api_key=${this.apiKey}&language=${this.language}`;
    return this.http.get<MovieResponse>(url).pipe(
      catchError(error => {
        console.error('Error al obtener las películas populares', error);
        return throwError(() => new Error('Error al obtener las películas'));
      })
    );
  }

  getMovieDetails(id: string): Observable<Movie> {
    const url = `${this.baseUrl}/${id}?api_key=${this.apiKey}&language=${this.language}`;
    return this.http.get<Movie>(url).pipe(
      catchError(error => {
        console.error(`Error al obtener detalles de la película con ID ${id}`, error);
        return throwError(() => new Error('Error al obtener los detalles de la película'));
      })
    );
  }
}
