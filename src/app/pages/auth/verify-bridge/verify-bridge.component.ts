import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-verify-bridge',
  templateUrl: './verify-bridge.component.html',
  styleUrls: ['./verify-bridge.component.css']
})
export class VerifyBridgeComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (token) {
        // Guarda el token localmente o en un servicio, si es necesario
        localStorage.setItem('confirmationToken', token);

        // Redirecciona a la ruta de confirmación
        this.router.navigate(['/email-confirm'], {
          queryParams: { token: token }
        });
      } else {
        // Si no hay token, redirige a una página de error o al home
        this.router.navigate(['/']);
      }
    });
  }
}
