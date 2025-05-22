// src/app/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Session } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://tcbplmfcfwkjvgrpnjxr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjYnBsbWZjZndranZncnBuanhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwOTQyNDAsImV4cCI6MjA2MTY3MDI0MH0.uYiX2oRrgHRbU70XQrtEbHrQKyOZoQso7RSku5N3tQM'; // (Clave pública recortada)

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    }

    // Registro de usuario en auth + metadatos
    async register(email: string, password: string, userMetadata: any = {}) {
        return await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: userMetadata
            }
        });
    }

    // Insertar manualmente en tabla 'usuarios'
    async insertUsuario(usuario: any) {
        return await this.supabase
            .from('usuarios')
            .insert([usuario]);
    }

    // Login de usuario
    async login(email: string, password: string) {
        return await this.supabase.auth.signInWithPassword({ email, password });
    }

    // Actualizar last_login en tabla 'usuarios'
    async updateLastLogin(email: string) {
        return await this.supabase
            .from('usuarios')
            .update({ last_login: new Date().toISOString() })
            .eq('email', email);
    }

    // Logout de usuario
    async logout() {
        return await this.supabase.auth.signOut();
    }

    // Obtener el usuario actualmente autenticado
    getUser() {
        return this.supabase.auth.getUser();
    }
    // Verificar email con el token (después de hacer clic en el enlace del correo)
    async verifyEmail(email: string, token: string) {
        return await this.supabase.auth.verifyOtp({
            type: 'signup',
            email,
            token
        });
    }

    async setSession(session: Session) {
        await this.supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token
        });
    }

    async getSession() {
        return await this.supabase.auth.getSession();
    }
}