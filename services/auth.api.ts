import { ApiResponse, apiService } from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profileImage?: string;
  role?: 'user' | 'staff' | 'admin';
  isStaff?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  /**
   * Registra un nuevo usuario
   */
  async register(data: RegisterData): Promise<ApiResponse<LoginResponse>> {
    try {
      return await apiService.post<LoginResponse>('/auth/register', data);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al registrar usuario',
      };
    }
  },

  /**
   * Inicia sesión
   */
  async login(data: LoginData): Promise<ApiResponse<LoginResponse>> {
    try {
      return await apiService.post<LoginResponse>('/auth/login', data);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión',
      };
    }
  },

  /**
   * Refresca el token (requiere autenticación)
   */
  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    try {
      return await apiService.post<LoginResponse>('/auth/refresh');
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al refrescar token',
      };
    }
  },

  /**
   * Obtiene el usuario actual (requiere autenticación)
   */
  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    try {
      return await apiService.get<{ user: User }>('/auth/me');
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener usuario',
      };
    }
  },
};

