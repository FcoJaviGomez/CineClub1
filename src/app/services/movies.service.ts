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
  private actoresUrl  = `${environment.supabaseFnUrl}/get-actores`;

  constructor(private http: HttpClient) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  // Agrega token a la cabecera
  private async crearCabeceraAutorizada(): Promise<HttpHeaders> {
    const { data } = await this.supabase.auth.getSession();
    const token = data.session?.access_token || '';
    console.log('[MoviesService] Token JWT:', token);
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // POPULARES
  getPopularMovies(): Observable<any> {
    return from(this.supabase.auth.getSession()).pipe(
      switchMap(({ data }) => {
        const token = data.session?.access_token;
        if (!token) {
          return throwError(() => new Error('Usuario no autenticado'));
        }
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.get<any>(this.popularesUrl, { headers });
      }),
      catchError(error => {
        console.error('Error al obtener populares', error);
        return throwError(() => new Error('Error al obtener populares'));
      })
    );
  }


  // DETALLES
  getMovieDetails(id: string): Observable<any> {
    return from(this.crearCabeceraAutorizada()).pipe(
      switchMap(headers =>
        this.http.post<any>(this.detallesUrl, { id }, { headers }).pipe(
          catchError(error => {
            console.error('Error al obtener detalles', error);
            return throwError(() => new Error('Error al obtener los detalles'));
          })
        )
      )
    );
  }

  // 👥 ACTORES
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
}
