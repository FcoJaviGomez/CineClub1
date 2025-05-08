import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router'; // 👈 Importa esto
import { routes } from './app/app.routes'; // 👈 Importa tus rutas

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes) // 👈 Aquí sí es válido ponerlo
  ]
});
