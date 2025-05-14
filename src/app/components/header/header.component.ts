import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(private router: Router) {}

  cerrarSesion() {
    // this.usuarioService.logout()
    this.router.navigate(['/login']);
  }

  irHome() {
    this.router.navigate(['/home']);
  }

}
