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

      if (token) {
        // Opcional: guardar el token
        localStorage.setItem('confirmationToken', token);

        // Redireccionar a email-confirm
        this.router.navigate(['/email-confirm'], {
          queryParams: { token: token }
        });
      } else {
        // Redirigir a inicio en caso de error
        this.router.navigate(['/']);
      }
    });
  }
}
