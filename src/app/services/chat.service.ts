import { Injectable } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

export interface MensajeChat {
    id?: string;
    usuario_id: string;
    contenido: string;
    creado_en?: string;
    nombre_usuario?: string;
    avatar_url?: string;

    // NUEVOS CAMPOS PARA RESPUESTA
    mensaje_respuesta_id?: string;
    mensaje_respuesta?: {
        contenido: string;
        nombre_usuario?: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private supabase: SupabaseClient;
    private mensajesSubject = new BehaviorSubject<MensajeChat[]>([]);
    mensajes$ = this.mensajesSubject.asObservable();

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
    }

    async cargarMensajes() {
        const { data, error } = await this.supabase
            .from('mensajes_chat')
            .select('*')
            .order('creado_en', { ascending: true });

        if (!error && data) {
            this.mensajesSubject.next(data as MensajeChat[]);
        } else {
            console.error('❌ Error al cargar mensajes:', error);
        }
    }

    async enviarMensaje(contenido: string, usuarioId: string, respondiendoA?: MensajeChat) {
        if (!contenido || !usuarioId) {
            console.warn('[ENVIAR] Faltan datos', { contenido, usuarioId });
            return;
        }

        const { data: perfil, error: perfilError } = await this.supabase
            .from('usuarios')
            .select('nombre, imagen_url')
            .eq('id', usuarioId)
            .maybeSingle();

        if (perfilError || !perfil) {
            console.error('❌ Error al obtener perfil:', perfilError);
            return;
        }

        const nuevoMensaje: MensajeChat = {
            contenido,
            usuario_id: usuarioId,
            nombre_usuario: perfil.nombre || 'Anónimo',
            avatar_url: perfil.imagen_url || `https://ui-avatars.com/api/?name=${perfil.nombre || 'Anon'}`
        };

        // Si el mensaje es una respuesta
        if (respondiendoA && respondiendoA.id) {
            nuevoMensaje.mensaje_respuesta_id = respondiendoA.id;
            nuevoMensaje.mensaje_respuesta = {
                contenido: respondiendoA.contenido,
                nombre_usuario: respondiendoA.nombre_usuario
            };
        }

        const { error } = await this.supabase
            .from('mensajes_chat')
            .insert([nuevoMensaje]);

        if (error) {
            console.error('❌ Error al insertar mensaje:', error.message);
        }
    }

    escucharMensajes() {
        this.supabase
            .channel('chat')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'mensajes_chat'
                },
                (payload: { new: MensajeChat }) => {
                    const nuevo = payload.new;
                    const actualizados = [...this.mensajesSubject.value, nuevo];
                    this.mensajesSubject.next(actualizados);
                }
            )
            .subscribe();
    }
}
