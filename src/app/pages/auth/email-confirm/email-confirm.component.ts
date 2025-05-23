import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-confirm',
  templateUrl: './email-confirm.component.html',
  styleUrls: ['./email-confirm.component.css'],
  imports: [CommonModule]
})
export class EmailConfirmComponent implements OnInit {
  private supabase: SupabaseClient;
  statusMessage: string = 'Verificando tu correo...';
  isSuccess: boolean = false;
  isError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async params => {
      const token = params['token'];

      if (!token) {
        this.statusMessage = '❌ Acceso inválido. Token de verificación no encontrado.';
        this.isError = true;

        // Redirección automática después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);

        return;
      }

      await this.verificarToken(token);
    });
  }

  async verificarToken(token: string): Promise<void> {
    try {
      const { data, error } = await this.supabase.auth.setSession({
        access_token: token,
        refresh_token: ''
      });

      if (error || !data?.session) {
        this.statusMessage = '❌ No se pudo establecer la sesión.';
        this.isError = true;
        return;
      }

      this.statusMessage = '✅ ¡Correo verificado correctamente!';
      this.isSuccess = true;

    } catch (err) {
      console.error(err);
      this.statusMessage = '❌ Ocurrió un error inesperado.';
      this.isError = true;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
