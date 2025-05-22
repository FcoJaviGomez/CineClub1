import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-confirm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-confirm.component.html',
  styleUrls: ['./email-confirm.component.css']
})
export class EmailConfirmComponent implements OnInit {
  message = 'Verificando correo...';
  loading = false;
  success = false;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.confirmEmail();
  }

  private async confirmEmail(): Promise<void> {
    this.loading = true;

    const token = this.route.snapshot.queryParamMap.get('confirmation_token');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (!token || !email) {
      this.message = 'Faltan datos de verificación en la URL.';
      this.error = true;
      this.loading = false;
      return;
    }

    try {
      const { error } = await this.supabaseService.verifyEmail(email, token);

      if (error) {
        this.message = 'Hubo un error al verificar tu correo.';
        this.error = true;
      } else {
        this.message = '✅ Tu correo fue verificado correctamente.';
        this.success = true;
      }
    } catch (err) {
      this.message = 'Ocurrió un error inesperado.';
      this.error = true;
      this.logError(err);
    } finally {
      this.loading = false;
    }
  }

  private logError(error: unknown): void {
    if (!environment.production) {
      console.error(error);
    }
  }
}
