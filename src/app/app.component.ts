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
    this.actualizarLayout(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.actualizarLayout(event.urlAfterRedirects);
      });
  }

  private actualizarLayout(url: string) {
    const ocultar = ['/login', '/registro', '/email-confirm', '/verify-bridge'].includes(url);
    this.mostrarLayout$.next(!ocultar);
  }
}
