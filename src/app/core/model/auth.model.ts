export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  nombreCompleto: string;
  rol: string;
}

export interface UsuarioSesion {
  username: string;
  nombreCompleto: string;
  rol: string;
}
