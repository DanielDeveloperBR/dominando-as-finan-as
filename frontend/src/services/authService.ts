import { Usuario } from '../types';

const API_URL = '/api/auth';

export class AuthService {
  static async login(email: string, senha: string): Promise<Usuario> {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, senha }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao realizar login');
    }

    return res.json();
  }

  static async signup(nome: string, email: string, senha: string, salarioMensal: number): Promise<Usuario> {
    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha, salarioMensal }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao realizar cadastro');
    }

    return res.json();
  }

  static async logout(): Promise<void> {
    await fetch(`${API_URL}/logout`, { method: 'POST', credentials: 'include' });
  }

  static async me(): Promise<Usuario | null> {
    try {
      const res = await fetch(`${API_URL}/me`, {credentials: 'include'});
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }
}
