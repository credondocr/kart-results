
const STRAPI_URL = 'https://strapi-production-c6c3.up.railway.app';

interface LoginResponse {
  jwt: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

interface LoginData {
  identifier: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export class AuthService {
  static async login(data: LoginData): Promise<LoginResponse> {
    const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message || 'Error en el inicio de sesión');
    }

    const result = await response.json();
    // Guardar el token en localStorage
    localStorage.setItem('auth_token', result.jwt);
    return result;
  }

  static async register(data: RegisterData): Promise<LoginResponse> {
    const response = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message || 'Error en el registro');
    }

    const result = await response.json();
    // Guardar el token en localStorage
    localStorage.setItem('auth_token', result.jwt);
    return result;
  }

  static logout(): void {
    localStorage.removeItem('auth_token');
  }

  static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
