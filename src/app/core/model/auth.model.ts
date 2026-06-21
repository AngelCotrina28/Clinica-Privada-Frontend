export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  username: string;
  nombreCompleto: string;
  rol: string;
}

export interface UsuarioSesion {
  id: number;
  username: string;
  nombreCompleto: string;
  rol: string;
}