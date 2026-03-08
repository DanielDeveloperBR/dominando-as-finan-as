import { useState, useEffect } from 'react';
import { Usuario } from '@/types';
import { AuthService } from '@/services/authService';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await AuthService.me();
        setUsuario(user);
      } catch {
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, senha: string) => {
    const user = await AuthService.login(email, senha);
    setUsuario(user);
  };

  const signup = async (nome: string, email: string, senha: string, salarioMensal: number) => {
    await AuthService.signup(nome, email, senha, salarioMensal);
  };

  const logout = async () => {
    await AuthService.logout();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}