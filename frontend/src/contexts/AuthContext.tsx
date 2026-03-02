import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario } from '../types';
import { AuthService } from '../services/authService';

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  signup: (nome: string, email: string, senha: string, salarioMensal: number) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await AuthService.me();
        setUsuario(user);
      } catch (error) {
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
    const user = await AuthService.signup(nome, email, senha, salarioMensal);
    setUsuario(user);
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
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
