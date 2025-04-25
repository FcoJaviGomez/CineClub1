import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Modelo de usuario (a futuro puedes mejorarlo con interfaces)
export class Usuario {
  constructor(
    public id: number,
    public nombre: string,
    public email: string,
    public password: string,
    public rol: string,
    public otroCampo?: string
  ) {}
}

@Component({
  selector: 'app-login',
  standalone: true, // 👈 Importante
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public usuario: Usuario = new Usuario(0, "", "", "", "");
  public validacion: any = ["", ""];

  constructor(private router: Router) {}

  iniciarSesion() {
    if (this.validar(this.usuario)) {
      // Aquí luego conectarás Supabase
      console.log("Login válido. Usuario:", this.usuario);

      // Simular navegación después de login correcto
      this.router.navigate(['/']);
    } else {
      this.validacion = ["Datos incompletos", false];
    }
  }

  validar(user: Usuario): boolean {
    return user.email !== "" && user.password !== "";
  }
}
