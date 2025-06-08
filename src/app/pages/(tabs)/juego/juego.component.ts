import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';
import { HttpClient } from '@angular/common/http';

interface MovieOption {
    title: string;
    poster_path: string;
    vote_average: number;
}

interface RankingEntry {
    nombre: string;
    puntuacion: number;
}

@Component({
    selector: 'app-juego',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './juego.component.html',
    styleUrls: ['./juego.component.css'],
})
export class JuegoComponent implements OnInit {
    peliculaActual!: MovieOption;
    siguientePelicula!: MovieOption;
    opciones: MovieOption[] = [];
    puntuacion = 0;
    juegoTerminado = false;
    mostrandoPuntuacion = false;
    ranking: RankingEntry[] = [];
    mostrarRanking = false;
    nombreUsuario: string = '';
    puntuacionPersonal: number = 0;
    Math = Math;

    constructor(
        private http: HttpClient,
        private supabase: SupabaseService
    ) { }

    async ngOnInit() {
        await this.obtenerPeliculas();
        this.siguienteRonda();
        this.obtenerRanking();
    }

    async obtenerPeliculas() {
        const url =
            'https://api.themoviedb.org/3/movie/popular?api_key=8e98c3442d72e4400ad45a11f9d635a7&language=es-ES&page=1';
        const response: any = await this.http.get(url).toPromise();
        this.opciones = response.results.filter(
            (m: any) => m.vote_count > 100 && m.poster_path
        );
    }

    siguienteRonda() {
        const copia = [...this.opciones];
        this.peliculaActual =
            copia.splice(Math.floor(Math.random() * copia.length), 1)[0];
        this.siguientePelicula =
            copia.splice(Math.floor(Math.random() * copia.length), 1)[0];
        this.mostrandoPuntuacion = false;
    }

    responder(opcion: 'mayor' | 'menor') {
        this.mostrandoPuntuacion = true;

        setTimeout(() => {
            const correcta =
                (opcion === 'mayor' &&
                    this.siguientePelicula.vote_average >=
                    this.peliculaActual.vote_average) ||
                (opcion === 'menor' &&
                    this.siguientePelicula.vote_average <=
                    this.peliculaActual.vote_average);

            if (correcta) {
                this.puntuacion++;
                this.siguienteRonda();
            } else {
                this.juegoTerminado = true;
                this.guardarPuntuacion();
            }
        }, 2000); // 2 segundos mostrando la puntuación
    }

    async guardarPuntuacion() {
        const {
            data: { user },
            error: userError,
        } = await this.supabase.getUser();
        if (!user || userError) return;

        const { data: perfil } = await this.supabase.client
            .from('usuarios')
            .select('id, nombre')
            .eq('email', user.email)
            .maybeSingle();

        if (!perfil) return;

        const { data: actual } = await this.supabase.client
            .from('ranking_juego')
            .select('puntuacion')
            .eq('usuario_id', perfil.id)
            .maybeSingle();

        if (!actual || this.puntuacion > actual.puntuacion) {
            await this.supabase.client.from('ranking_juego').upsert({
                usuario_id: perfil.id,
                nombre: perfil.nombre,
                puntuacion: this.puntuacion,
            });
        }
    }

    async obtenerRanking() {
        const { data: { user }, error: userError } = await this.supabase.getUser();
        if (!user || userError) return;

        const { data: perfil } = await this.supabase.client
            .from('usuarios')
            .select('id, nombre')
            .eq('email', user.email)
            .maybeSingle();

        if (perfil) {
            this.nombreUsuario = perfil.nombre;

            const { data: personal } = await this.supabase.client
                .from('ranking_juego')
                .select('puntuacion')
                .eq('usuario_id', perfil.id)
                .maybeSingle();

            this.puntuacionPersonal = personal?.puntuacion || 0;
        }

        const { data, error } = await this.supabase.client
            .rpc('ranking_juego_unico');

        if (!error && data) {
            this.ranking = data;
        }
    }

    async reiniciarJuego() {
        this.juegoTerminado = false;
        this.puntuacion = 0;
        await this.obtenerPeliculas();
        this.siguienteRonda();
    }

    getPosterUrl(path: string): string {
        return `https://image.tmdb.org/t/p/w500${path}`;
    }
}
