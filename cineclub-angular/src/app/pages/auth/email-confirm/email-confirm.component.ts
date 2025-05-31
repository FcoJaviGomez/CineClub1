import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-email-confirm',
  templateUrl: './email-confirm.component.html',
  styleUrls: ['./email-confirm.component.css']
})
export class EmailConfirmComponent {
  statusMessage: string = '✅ ¡Correo verificado correctamente!';
  
  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
