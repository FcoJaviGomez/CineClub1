import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  async register(email: string, password: string, userMetadata: any = {}) {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata
      }
    });
  }

  async insertUsuario(usuario: any) {
    return await this.supabase.from('usuarios').insert([usuario]);
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
