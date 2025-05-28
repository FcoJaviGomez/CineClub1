import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Registro básico (solo crea el usuario en Auth)
   * No inserta en tabla 'usuarios' hasta que inicie sesión
   */
  async register(email: string, password: string, userMetadata: any = {}) {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata,
        emailRedirectTo: 'https://cineclubb.netlify.app/email-confirm'
      }
    });
  }

  /**
   * Login del usuario. Si no existe en la tabla 'usuarios', se inserta.
   */
  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;

    const user = data.user;

    if (user) {
      // Verificar si ya tiene fila en la tabla usuarios
      const { data: existingUser, error: fetchError } = await this.supabase
        .from('usuarios')
        .select('id')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Otro error inesperado
        throw fetchError;
      }

      if (!existingUser) {
        // Obtener metadata desde el perfil si se necesita
        const userMetadata = user.user_metadata || {};

        const { error: insertError } = await this.supabase.from('usuarios').insert([
          {
            id: user.id,
            email: (user.email ?? '').toLowerCase(),
            nombre: userMetadata["nombre"] || '',
            apellidos: userMetadata["apellidos"] || '',
            fecha_nacimiento: userMetadata["fecha_nacimiento"] || null,
            created_at: new Date().toISOString(),
            rol: 'user'
          }
        ]);

        if (insertError) throw insertError;
      }
    }

    return data;
  }

  async insertUsuario(usuario: any) {
    return await this.supabase.from('usuarios').insert([usuario]);
  }

  async esAdmin(): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('is_admin');
    return !!data && !error;
  }

  async updateLastLogin(email: string) {
    return await this.supabase
      .from('usuarios')
      .update({ last_login: new Date().toISOString() })
      .eq('email', email);
  }

  async logout() {
    return await this.supabase.auth.signOut();
  }

  getUser() {
    return this.supabase.auth.getUser();
  }

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
