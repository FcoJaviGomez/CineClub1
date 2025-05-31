export class Usuario {
    public id_usuario: number
    public nombre: string
    public apellidos: string
    public email: string
    public password: string
    public fecha_nacimiento: string

    constructor(id_usuario: number = 0, nombre: string, apellidos: string, email: string, password: string, fecha_nacimiento: string) {
        this.id_usuario = id_usuario;
        this.nombre = nombre;
        this.apellidos = apellidos
        this.email = email;
        this.password = password;
        this.fecha_nacimiento = fecha_nacimiento
    }
}