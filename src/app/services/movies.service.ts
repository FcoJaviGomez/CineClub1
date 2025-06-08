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

  private baseUrl = 'https://api.themoviedb.org/3';
  private apiKey = environment.tmdbApiKey;
  private language = 'es-ES';

  constructor(private http: HttpClient) { }

  getPopularMovies(): Observable<MovieResponse> {
    const url = `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=${this.language}`;
    return this.http.get<MovieResponse>(url).pipe(
      catchError(error => {
        console.error('Error al obtener las películas populares', error);
        return throwError(() => new Error('Error al obtener las películas'));
      })
    );
  }

  getMovieDetails(id: string): Observable<Movie> {
    const url = `${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&language=${this.language}`;
    return this.http.get<Movie>(url).pipe(
      catchError(error => {
        console.error(`Error al obtener detalles de la película con ID ${id}`, error);
        return throwError(() => new Error('Error al obtener los detalles de la película'));
      })
    );
  }

  // ✅ Método corregido y tipado
  getActores(id: string): Observable<{ cast: any[] }> {
    const url = `${this.baseUrl}/movie/${id}/credits?api_key=${this.apiKey}&language=${this.language}`;
    return this.http.get<{ cast: any[] }>(url).pipe(
      catchError(error => {
        console.error(`Error al obtener el reparto de la película con ID ${id}`, error);
        return throwError(() => new Error('Error al obtener el reparto de la película'));
      })
    );
  }

  getGenres(): Observable<any> {
    const url = `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}&language=${this.language}`;
    return this.http.get<any>(url).pipe(
      catchError(error => {
        console.error('Error al obtener géneros', error);
        return throwError(() => new Error('Error al obtener géneros'));
      })
    );
  }

  getMoviesByGenre(genreId: string): Observable<MovieResponse> {
    const url = `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&language=${this.language}&with_genres=${genreId}`;
    return this.http.get<MovieResponse>(url).pipe(
      catchError(error => {
        console.error('Error al obtener películas por género', error);
        return throwError(() => new Error('Error al obtener películas por género'));
      })
    );
  }

  buscarPeliculasPorNombre(nombre: string): Observable<any> {
    const url = `${this.baseUrl}/search/movie?query=${encodeURIComponent(nombre)}&api_key=${this.apiKey}&language=${this.language}`;
    return this.http.get<any>(url);
  }

}
