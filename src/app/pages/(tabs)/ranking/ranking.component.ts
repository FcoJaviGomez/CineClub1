import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-ranking',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './ranking.component.html',
    styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {
    rankingPeliculas: any[] = [];
    cargando: boolean = true;

    constructor(
        private supabaseService: SupabaseService,
        private http: HttpClient
    ) { }

    async ngOnInit() {
        try {
            const { data, error } = await this.supabaseService.client
                .from('reseñas')
                .select('tmdb_id, puntuacion')
                .returns<any[]>();

            if (error) throw error;

            const agrupado: Record<number, { total: number; cantidad: number }> = {};

            for (const r of data) {
                if (!agrupado[r.tmdb_id]) {
                    agrupado[r.tmdb_id] = { total: 0, cantidad: 0 };
                }
                agrupado[r.tmdb_id].total += r.puntuacion;
                agrupado[r.tmdb_id].cantidad += 1;
            }

            const lista = Object.entries(agrupado).map(([tmdb_id, stats]) => ({
                tmdb_id: +tmdb_id,
                media: +(stats.total / stats.cantidad).toFixed(1),
                cantidad: stats.cantidad
            }));

            // Ordenar de mayor a menor media
            lista.sort((a, b) => b.media - a.media);

            // Cargar info de las películas desde TMDB
            const topConInfo = await Promise.all(
                lista.slice(0, 20).map(async (peli) => {
                    try {
                        const tmdbUrl = `https://api.themoviedb.org/3/movie/${peli.tmdb_id}?api_key=${environment.tmdbApiKey}&language=es-ES`;
                        const datos: any = await this.http.get(tmdbUrl).toPromise();
                        return {
                            ...peli,
                            titulo: datos.title,
                            poster_path: datos.poster_path
                        };
                    } catch (e) {
                        return null;
                    }
                })
            );

            this.rankingPeliculas = topConInfo.filter(p => p !== null);
        } catch (e) {
            console.error('Error cargando ranking:', e);
        } finally {
            this.cargando = false;
        }
    }
}
