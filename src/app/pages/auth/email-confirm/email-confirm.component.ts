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
    this.supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session) {
        this.statusMessage = '❌ La sesión no pudo ser verificada.';
        this.isError = true;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      } else {
        this.statusMessage = '✅ ¡Correo verificado correctamente!';
        this.isSuccess = true;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 6000);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
