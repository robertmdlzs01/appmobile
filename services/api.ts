const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.eventu.com/api';
const API_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN;
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000', 10);

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiService {
  private baseURL: string;
  private token: string | undefined;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = API_TOKEN;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Respuesta del servidor no es JSON');
    }

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
        message: data.message || 'Error en la solicitud',
        data: data,
      };
    }

    return data;
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      let url = `${this.baseURL}${endpoint}`;
      
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        const queryString = searchParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw {
          status: 0,
          statusText: 'Timeout',
          message: 'La solicitud tardó demasiado tiempo',
        };
      }
      if (error.status) {
        throw error;
      }
      throw {
        status: 0,
        statusText: 'Network Error',
        message: error.message || 'Error de conexión',
      };
    }
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw {
          status: 0,
          statusText: 'Timeout',
          message: 'La solicitud tardó demasiado tiempo',
        };
      }
      if (error.status) {
        throw error;
      }
      throw {
        status: 0,
        statusText: 'Network Error',
        message: error.message || 'Error de conexión',
      };
    }
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw {
          status: 0,
          statusText: 'Timeout',
          message: 'La solicitud tardó demasiado tiempo',
        };
      }
      if (error.status) {
        throw error;
      }
      throw {
        status: 0,
        statusText: 'Network Error',
        message: error.message || 'Error de conexión',
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw {
          status: 0,
          statusText: 'Timeout',
          message: 'La solicitud tardó demasiado tiempo',
        };
      }
      if (error.status) {
        throw error;
      }
      throw {
        status: 0,
        statusText: 'Network Error',
        message: error.message || 'Error de conexión',
      };
    }
  }

  setToken(token: string | undefined): void {
    this.token = token;
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}

export const apiService = new ApiService();

