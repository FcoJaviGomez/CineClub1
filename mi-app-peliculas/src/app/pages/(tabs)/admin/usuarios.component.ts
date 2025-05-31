import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
    usuarios: any[] = [];
    cargando = true;

    constructor(
        private supabaseService: SupabaseService,
        private router: Router
    ) { }

    async ngOnInit() {
        const { data: userResult, error: userError } = await this.supabaseService.getUser();
        const user = userResult?.user;

        if (userError || !user) {
            this.router.navigate(['/login']);
            return;
        }

        const { data: perfil, error: perfilError } = await this.supabaseService.client
            .from('usuarios')
            .select('rol')
            .eq('email', user.email)
            .maybeSingle();

        if (perfilError || perfil?.rol !== 'admin') {
            this.router.navigate(['/home']);
            return;
        }

        await this.cargarUsuarios();
    }

    async cargarUsuarios() {
        this.cargando = true;
        const { data, error } = await this.supabaseService.client
            .from('usuarios')
            .select('id, nombre, apellidos, email, rol');

        if (!error && data) {
            this.usuarios = data;
        } else {
            console.error('Error al cargar usuarios:', error);
        }
        this.cargando = false;
    }

    async cambiarRol(usuario: any) {
        const nuevoRol = usuario.rol === 'admin' ? 'user' : 'admin';

        const { error } = await this.supabaseService.client
            .from('usuarios')
            .update({ rol: nuevoRol })
            .eq('id', usuario.id);

        if (!error) {
            usuario.rol = nuevoRol;
        } else {
            console.error('Error al actualizar rol:', error);
        }
    }

    async eliminarUsuario(id: number) {
        const confirmar = confirm('¿Estás seguro de que deseas eliminar este usuario?');

        if (!confirmar) return;

        const { error } = await this.supabaseService.client
            .from('usuarios')
            .delete()
            .eq('id', id);

        if (!error) {
            this.usuarios = this.usuarios.filter(u => u.id !== id);
        } else {
            console.error('Error al eliminar usuario:', error);
        }
    }
}
