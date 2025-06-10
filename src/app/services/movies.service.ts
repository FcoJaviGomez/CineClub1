import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MoviesService {
  private supabase: SupabaseClient;

  private popularesUrl = `${environment.supabaseFnUrl}/get-populares`;
  private detallesUrl = `${environment.supabaseFnUrl}/get-movie-details`;
  private actoresUrl = `${environment.supabaseFnUrl}/get-actores`;
  private genresUrl = `${environment.supabaseFnUrl}/get-genero`;
  private generoUrl = `${environment.supabaseFnUrl}/get-pelicula-genero`;
  private watchProvidersUrl = `${environment.supabaseFnUrl}/get-watch-providers`;
  private searchUrl = `${environment.supabaseFnUrl}/search-movies`;

  constructor(private http: HttpClient) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  private async crearCabeceraAutorizada(): Promise<HttpHeaders> {
    const { data } = await this.supabase.auth.getSession();
    const token = data.session?.access_token || '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getPopularMovies(): Observable<any> {
    return from(this.crearCabeceraAutorizada()).pipe(
      switchMap(headers =>
        this.http.get<any>(this.popularesUrl, { headers }).pipe(
          catchError(error => {
            console.error('Error al obtener películas populares', error);
            return throwError(() => new Error('Error al obtener películas populares'));
          })
        )
      )
    );
  }

  getMovieDetails(id: string): Observable<any> {
    return from(this.crearCabeceraAutorizada()).pipe(
      switchMap(headers =>
        this.http.post<any>(this.detallesUrl, { id }, { headers }).pipe(
          catchError(error => {
            console.error('Error al obtener detalles de la película', error);
            return throwError(() => new Error('Error al obtener detalles de la película'));
          })
        )
      )
    );
  }

  getActores(id: string): Observable<any> {
    return from(this.crearCabeceraAutorizada()).pipe(
      switchMap(headers =>
        this.http.post<any>(this.actoresUrl, { id }, { headers }).pipe(
          catchError(error => {
            console.error('Error al obtener actores', error);
            return throwError(() => new Error('Error al obtener actores'));
          })
        )
      )
    );
  }

  getGenres(): Observable<any> {
    return from(this.crearCabeceraAutorizada()).pipe(
      switchMap(headers =>
        this.http.get<any>(this.genresUrl, { headers }).pipe(
          catchError(error => {
            console.error('Error al obtener géneros', error);
            return throwError(() => new Error('Error al obtener géneros'));
          })
        )
      )
    );
  }

  getMoviesByGenre(genreId: string): Observable<any> {
    return from(this.crearCabeceraAutorizada()).pipe(
      switchMap(headers =>
        this.http.post<any>(this.generoUrl, { genreId }, { headers }).pipe(
          catchError(error => {
            console.error('Error al obtener películas por género', error);
            return throwError(() => new Error('Error al obtener películas por género'));
          })
        )
      )
    );
  }

  getWatchProviders(id: number): Observable<any> {
    return from(this.crearCabeceraAutorizada()).pipe(
      switchMap(headers =>
        this.http.post<any>(this.watchProvidersUrl, { id }, { headers }).pipe(
          catchError(error => {
            console.error('Error al obtener proveedores de visualización', error);
            return throwError(() => new Error('Error al obtener proveedores de visualización'));
          })
        )
      )
    );
  }

  buscarPeliculasPorNombre(nombre: string): Observable<any> {
    return from(this.crearCabeceraAutorizada()).pipe(
      switchMap(headers =>
        this.http.post<any>(this.searchUrl, { query: nombre }, { headers }).pipe(
          catchError(error => {
            console.error('Error al buscar películas por nombre', error);
            return throwError(() => new Error('Error al buscar películas por nombre'));
          })
        )
      )
    );
  }
}
