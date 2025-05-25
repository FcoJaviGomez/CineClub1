import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

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
    this.route.queryParams.pipe(first()).subscribe(params => {
      const token = params['token'];
      const email = params['email'];

      if (token && email) {
        // Opcional: guardar el token
        localStorage.setItem('confirmationToken', token);

        // Redirigir a email-confirm con ambos parámetros
        this.router.navigate(['/email-confirm'], {
          queryParams: { token, email }
        });
      } else {
        // Redirigir si falta algo
        this.router.navigate(['/']);
      }
    });
  }
}
