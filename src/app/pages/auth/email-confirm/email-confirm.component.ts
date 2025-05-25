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
    this.route.queryParams.subscribe(async (params) => {
      const token = params['token'];
      const email = params['email'];

      if (!token || !email) {
        this.statusMessage = '❌ Token de verificación o correo electrónico no encontrado.';
        this.isError = true;
        setTimeout(() => this.router.navigate(['/login']), 3000);
        return;
      }

      try {
        const { data, error } = await this.supabase.auth.verifyOtp({
          type: 'signup',
          token,
          email
        });

        if (error) {
          this.statusMessage = '❌ Error al verificar el correo: ' + error.message;
          this.isError = true;
        } else {
          this.statusMessage = '✅ ¡Correo verificado correctamente!';
          this.isSuccess = true;
        }
      } catch (err) {
        console.error(err);
        this.statusMessage = '❌ Ocurrió un error inesperado.';
        this.isError = true;
      }

      setTimeout(() => this.router.navigate(['/login']), 5000);
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
