import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { Session } from '@supabase/supabase-js';

@Component({
  selector: 'app-email-confirm',
  templateUrl: './email-confirm.component.html',
  styleUrls: ['./email-confirm.component.css']
})
export class EmailConfirmComponent implements OnInit {
  message = 'Verificando correo...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService
  ) { }

  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('confirmation_token');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (token && email) {
      try {
        const { data, error } = await this.supabaseService.verifyEmail(email, token);

        if (error) {
          console.error(error);
          this.message = 'Hubo un error al verificar el correo.';
        } else if (data?.session) {
          // Guardar sesión manualmente
          await this.supabaseService.setSession(data.session);
          console.log('Sesión establecida:', data.session);

          this.message = 'Correo verificado correctamente. Iniciando sesión...';

          // Redirigir después de un pequeño retraso para asegurar que el guard detecte la sesión
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 500);
        } else {
          this.message = 'Correo verificado, pero no se inició sesión automáticamente.';
        }
      } catch (err) {
        console.error(err);
        this.message = 'Ocurrió un error inesperado.';
      }
    } else {
      this.message = 'Faltan datos de verificación en la URL.';
    }
  }
}
