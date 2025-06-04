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
    styleUrls: ['./juego.component.css']

})
export class JuegoComponent implements OnInit {
    opciones: MovieOption[] = [];
    puntuacion = 0;
    haFallado = false;
    ranking: RankingEntry[] = [];
    cargando = true;
    animando = false;
    mostrarRanking = false;

    peliculaA!: MovieOption;
    peliculaB!: MovieOption;

    // TMDB API Key directa (puedes ocultarla en backend si deseas)
    private tmdbApiKey = '8e98c3442d72e4400ad45a11f9d635a7';

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
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${this.tmdbApiKey}&language=es-ES&page=1`;
        const response: any = await this.http.get(url).toPromise();
        this.opciones = response.results.filter((m: any) => m.vote_count > 100 && m.poster_path);
        this.cargando = false;
    }

    siguienteRonda() {
        const copia = [...this.opciones];
        this.peliculaA = copia.splice(Math.floor(Math.random() * copia.length), 1)[0];
        this.peliculaB = copia.splice(Math.floor(Math.random() * copia.length), 1)[0];
        this.haFallado = false;
    }

    responder(opcion: 'mayor' | 'menor') {
        const esCorrecto =
            (opcion === 'mayor' && this.peliculaB.vote_average >= this.peliculaA.vote_average) ||
            (opcion === 'menor' && this.peliculaB.vote_average <= this.peliculaA.vote_average);

        if (esCorrecto) {
            this.animando = true;
            setTimeout(() => {
                this.puntuacion++;
                this.siguienteRonda();
                this.animando = false;
            }, 500); // tiempo de la animación (debe coincidir con el CSS)
        } else {
            this.haFallado = true;
            this.guardarPuntuacion();
        }
    }


    get juegoTerminado(): boolean {
        return this.haFallado;
    }

    get peliculaActual(): MovieOption {
        return this.peliculaA;
    }

    get siguientePelicula(): MovieOption {
        return this.peliculaB;
    }

    getPosterUrl(path: string): string {
        return `https://image.tmdb.org/t/p/w500${path}`;
    }

    async guardarPuntuacion() {
        const { data: { user }, error: userError } = await this.supabase.getUser();
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
            await this.supabase.client
                .from('ranking_juego')
                .upsert({
                    usuario_id: perfil.id,
                    nombre: perfil.nombre,
                    puntuacion: this.puntuacion
                });
        }
    }

    async obtenerRanking() {
        const { data, error } = await this.supabase.client
            .rpc('ranking_juego_unico')  // función recomendada abajo

        if (error) {
            console.error('Error al cargar ranking:', error);
            return;
        }

        this.ranking = data || [];
    }


    reiniciarJuego() {
        this.puntuacion = 0;
        this.siguienteRonda();
    }
}
