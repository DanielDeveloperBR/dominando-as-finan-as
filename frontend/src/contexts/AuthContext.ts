import { createContext } from 'react';
import { Usuario } from '@/types';

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  signup: (nome: string, email: string, senha: string, salarioMensal: number) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);