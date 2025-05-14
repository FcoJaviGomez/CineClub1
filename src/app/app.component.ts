import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  mostrarLayout$ = new BehaviorSubject<boolean>(true);

  constructor(public router: Router) {}

  ngOnInit() {
    // Verificar la URL cuando se inicializa
    this.actualizarLayout(this.router.url);

    // Y también al cambiar de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.actualizarLayout(event.urlAfterRedirects);
    });
  }

  private actualizarLayout(url: string) {
    const ocultar =  url === '/login' || url === '/registro';
    this.mostrarLayout$.next(!ocultar);
  }
}
