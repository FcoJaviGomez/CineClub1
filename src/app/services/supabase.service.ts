import { Injectable } from '@angular/core';
import {
  createClient,
  SupabaseClient,
  Session,
  AuthResponse,
  User
} from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  // ✅ Acceso directo al cliente por si lo necesitas en otro componente
  get client(): SupabaseClient {
    return this.supabase;
  }

  /**
   * REGISTRO: Solo crea el usuario en Auth
   * Inserción en tabla 'usuarios' se hace al iniciar sesión
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
   * LOGIN: Inicia sesión y, si el usuario no existe en la tabla 'usuarios', lo inserta
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.supabase.auth.signInWithPassword({ email, password });

    const user = response.data.user;

    if (user) {
      const { data: existingUser, error: fetchError } = await this.supabase
        .from('usuarios')
        .select('id')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Ignora el error si es "no encontrado", pero lanza otros
        throw fetchError;
      }

      if (!existingUser) {
        const metadata = user.user_metadata || {};

        const { error: insertError } = await this.supabase.from('usuarios').insert([
          {
            id: user.id,
            email: user.email?.toLowerCase() || '',
            nombre: metadata["nombre"] || '',
            apellidos: metadata["apellidos"] || '',
            fecha_nacimiento: metadata["fecha_nacimiento"] || null,
            created_at: new Date().toISOString(),
            rol: 'user'
          }
        ]);

        if (insertError) throw insertError;
      }
    }

    return response;
  }

  /**
   * Inserta usuario manualmente (por si lo necesitas desde otro flujo)
   */
  async insertUsuario(usuario: any) {
    return await this.supabase.from('usuarios').insert([usuario]);
  }

  /**
   * Verifica si el usuario actual es admin
   */
  async esAdmin(): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('is_admin');
    return !!data && !error;
  }

  /**
   * Actualiza la fecha de último acceso del usuario
   */
  async updateLastLogin(email: string) {
    return await this.supabase
      .from('usuarios')
      .update({ last_login: new Date().toISOString() })
      .eq('email', email);
  }

  /**
   * Cierra sesión
   */
  async logout() {
    return await this.supabase.auth.signOut();
  }

    /**
   * Envia un correo para recuperar contraseña
   */
  async resetPassword(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://cineclubb.netlify.app/reset-password'
    });
  }

  /**
   * Actualiza los metadatos del usuario
   */
  async updatePassword(newPassword: string) {
    return await this.supabase.auth.updateUser({ password: newPassword });
  }

  /**
   * Obtiene el usuario actual
   */
  getUser() {
    return this.supabase.auth.getUser();
  }

  /**
   * Verifica email (si usas OTP)
   */
  async verifyEmail(email: string, token: string) {
    return await this.supabase.auth.verifyOtp({
      type: 'signup',
      email,
      token
    });
  }

  /**
   * Restaura una sesión existente
   */
  async setSession(session: Session) {
    await this.supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token
    });
  }

  /**
   * Obtiene la sesión actual
   */
  async getSession() {
    return await this.supabase.auth.getSession();
  }
}
