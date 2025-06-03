import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

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

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    this.cargando = true;

    try {
            // ✅ Llamada al método del servicio
            const data = await this.supabaseService.obtenerRankingDesdeReseñas();
            console.log('Reseñas con join:', data);

            // ✅ Agrupar reseñas por película y calcular promedio
            const agrupado: Record<string, {
            total: number;
            cantidad: number;
            info: any;
            }> = {};

            for (const r of data) {
            if (!r.peliculas) continue;

            const id = r.pelicula_id;
            if (!agrupado[id]) {
                agrupado[id] = {
                total: 0,
                cantidad: 0,
                info: r.peliculas
                };
            }

            agrupado[id].total += r.puntuacion;
            agrupado[id].cantidad += 1;
            }

            // ✅ Convertir a array ordenado por media
            const lista = Object.values(agrupado).map(p => ({
            ...p.info,
            media: +(p.total / p.cantidad).toFixed(1),
            cantidad: p.cantidad
            }));

            lista.sort((a, b) => b.media - a.media);

            this.rankingPeliculas = lista.slice(0, 20);
        } catch (e) {
            console.error('Error cargando ranking:', e);
        } finally {
            this.cargando = false;
        }
    }
}    

