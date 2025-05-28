import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-confirm',
  templateUrl: './email-confirm.component.html',
  styleUrls: ['./email-confirm.component.css'],
  imports: [CommonModule]
})
export class EmailConfirmComponent implements OnInit {
  statusMessage: string = '🔄 Verificando tu correo...';
  isSuccess: boolean = false;
  isError: boolean = false;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.supabaseService.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        this.statusMessage = '✅ ¡Correo verificado correctamente!';
        this.isSuccess = true;
      } else {
        this.statusMessage = '❌ Enlace inválido o expirado.';
        this.isError = true;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
