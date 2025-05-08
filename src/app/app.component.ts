import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterOutlet, Router } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    RouterModule  
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public router: Router) {}

  // Función que nos dice si mostrar o no
  mostrarLayout(): boolean {
    return this.router.url !== '/login' && this.router.url !== '/registro';
  }
}
