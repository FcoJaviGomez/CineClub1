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

  async register(email: string, password: string, userMetadata: any = {}) {
    // 1. Crear el usuario en Supabase Auth
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata, // opcional: guardar metadata en auth
        emailRedirectTo: 'https://cineclubb.netlify.app/email-confirm'
      }
    });

    if (error) return { error };

    const user = data?.user;

    // 2. Insertar en la tabla usuarios
    if (user) {
      const { error: insertError } = await this.supabase.from('usuarios').insert([
        {
          id: user.id, 
          email: email.toLowerCase(),
          ...userMetadata, 
          created_at: new Date().toISOString(),
          rol: 'user' 
        }
      ]);

      if (insertError) return { error: insertError };
    }

    return { data };
  }

  async insertUsuario(usuario: any) {
    return await this.supabase.from('usuarios').insert([usuario]);
  }

  async esAdmin(): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('is_admin');
    return !!data && !error;
  }

  async login(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
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
