import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MoviesService } from '../../../services/movies.service';
import { Movie } from '../../../models/movie.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  peliculasPopulares: Movie[] = [];
  peliculasActuales: Movie[] = [];
  cargando = true;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(private moviesService: MoviesService) {}

  ngOnInit() {
    this.cargarPeliculas();
  }

  ngAfterViewInit() {
    this.activarScrollConArrastre(this.scrollContainer.nativeElement);
  }

  cargarPeliculas() {
    this.cargando = true;
    this.moviesService.getPopularMovies().subscribe({
      next: (response) => {
        this.peliculasActuales = response.results.slice(0, 6);
        this.peliculasPopulares = response.results.slice(6);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar películas', err);
        this.cargando = false;
      }
    });
  }

  activarScrollConArrastre(element: HTMLElement) {
    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    element.addEventListener('mousedown', (e) => {
      isDown = true;
      element.classList.add('active');
      startX = e.pageX - element.offsetLeft;
      scrollLeft = element.scrollLeft;
    });

    element.addEventListener('mouseleave', () => {
      isDown = false;
      element.classList.remove('active');
    });

    element.addEventListener('mouseup', () => {
      isDown = false;
      element.classList.remove('active');
    });

    element.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const walk = (x - startX) * 1.5; // Ajusta la velocidad si quieres
      element.scrollLeft = scrollLeft - walk;
    });
  }
}
