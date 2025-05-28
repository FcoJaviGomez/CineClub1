import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
    selector: 'app-perfil',
    standalone: true,
    templateUrl: './perfil.component.html',
    styleUrls: ['./perfil.component.css'],
    imports: [CommonModule]
})
export class PerfilComponent implements OnInit {
    usuario: any = null;
    cargando = true;

    constructor(
        private supabaseService: SupabaseService,
        private router: Router
    ) { }

    async ngOnInit() {
        try {
            const { data: { user }, error: userError } = await this.supabaseService.getUser();

            if (userError) {
                console.error('Error al obtener el usuario autenticado:', userError);
                return;
            }

            if (user) {
                const { data, error } = await this.supabaseService.client
                    .from('usuarios')
                    .select('*')
                    .eq('email', user.email)
                    .maybeSingle(); // No falla si no hay resultado

                if (data) {
                    this.usuario = data;
                } else {
                    console.warn('No se encontró el perfil para:', user.email);
                }

                if (error) {
                    console.error('Error al cargar el perfil:', error);
                }
            }
        } catch (e) {
            console.error('Error inesperado:', e);
        } finally {
            this.cargando = false;
        }
    }

    async cerrarSesion() {
        await this.supabaseService.logout();
        this.router.navigate(['/login']);
    }
}
