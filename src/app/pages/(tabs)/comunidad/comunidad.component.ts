import { Component, OnInit, HostListener } from '@angular/core';
import { ChatService, MensajeChat } from '../../../services/chat.service';
import { SupabaseService } from '../../../services/supabase.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-comunidad',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './comunidad.component.html',
    styleUrls: ['./comunidad.component.css']
})
export class ComunidadComponent implements OnInit {
    mensajes: MensajeChat[] = [];
    mensajeNuevo: string = '';
    usuarioId: string | null = null;
    respondiendoA: MensajeChat | null = null;
    mensajeMenuAbiertoId: string | null = null;
    rol: string | null = null;


    constructor(
        private chatService: ChatService,
        private supabaseService: SupabaseService,
        private route: ActivatedRoute
    ) { }

    async ngOnInit() {
        const { data: { user }, error: userError } = await this.supabaseService.getUser();
        if (!user || userError) {
            console.error('[ERROR] No se pudo obtener el usuario');
            return;
        }

        const { data: perfil, error: perfilError } = await this.supabaseService.client
            .from('usuarios')
            .select('id, rol')  // incluir rol
            .eq('email', user.email)
            .maybeSingle();

        if (!perfil || perfilError) {
            console.error('[ERROR] No se pudo obtener el perfil del usuario');
            return;
        }

        this.usuarioId = perfil.id;
        this.rol = perfil.rol || null;
        this.chatService.cargarMensajes();
        this.chatService.escucharMensajes();
        this.chatService.mensajes$.subscribe((mensajes: MensajeChat[]) => {
            this.mensajes = mensajes;
            setTimeout(() => this.scrollAlFinal(), 100);
        });
    }

    async enviar() {
        if (!this.mensajeNuevo.trim() || !this.usuarioId) {
            console.warn('[ENVIAR] Falta mensaje o usuario');
            return;
        }

        await this.chatService.enviarMensaje(
            this.mensajeNuevo,
            this.usuarioId,
            this.respondiendoA ?? undefined
        );

        this.mensajeNuevo = '';
        this.respondiendoA = null;
        this.mensajeMenuAbiertoId = null;
        setTimeout(() => this.scrollAlFinal(), 100);
    }

    responderA(mensaje: MensajeChat) {
        this.respondiendoA = mensaje;
        this.mensajeMenuAbiertoId = null;
    }

    cancelarRespuesta() {
        this.respondiendoA = null;
    }

    toggleMenu(id?: string) {
        if (!id) return;
        this.mensajeMenuAbiertoId = this.mensajeMenuAbiertoId === id ? null : id;
    }


    @HostListener('document:click', ['$event.target'])
    onClickOutside(target: HTMLElement) {
        if (!target.closest('.menu-container')) {
            this.mensajeMenuAbiertoId = null;
        }
    }

    scrollAlFinal() {
        const contenedor = document.querySelector('.mensajes');
        if (contenedor) {
            contenedor.scrollTop = contenedor.scrollHeight;
        }
    }

    formatearFecha(fechaIso: string): string {
        const fecha = new Date(fechaIso);
        const hoy = new Date();
        const ayer = new Date();
        ayer.setDate(hoy.getDate() - 1);

        const mismaFecha = (a: Date, b: Date) =>
            a.getDate() === b.getDate() &&
            a.getMonth() === b.getMonth() &&
            a.getFullYear() === b.getFullYear();

        if (mismaFecha(fecha, hoy)) return 'Hoy';
        if (mismaFecha(fecha, ayer)) return 'Ayer';

        return fecha.toLocaleDateString();
    }

    mensajesAgrupados() {
        const grupos: { fecha: string, mensajes: MensajeChat[] }[] = [];

        for (const mensaje of this.mensajes) {
            if (!mensaje.creado_en) continue;

            const fecha = this.formatearFecha(mensaje.creado_en);
            let grupo = grupos.find(g => g.fecha === fecha);

            if (!grupo) {
                grupo = { fecha, mensajes: [] };
                grupos.push(grupo);
            }

            grupo.mensajes.push(mensaje);
        }

        return grupos;
    }

    async eliminarMensaje(id: string | undefined) {
        if (!id) return;

        const { error } = await this.supabaseService.client
            .from('mensajes_chat')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('❌ Error al eliminar mensaje:', error);
        } else {
            // ❌ Cierra el menú
            this.mensajeMenuAbiertoId = null;

            // ✅ Elimina el mensaje del array local
            this.mensajes = this.mensajes.filter(m => m.id !== id);
        }
    }
}
