import bcrypt from 'bcryptjs';
import { query } from '../config/db';
import { Usuario } from '../types';

export class AuthService {
  static async registrar(nome: string, email: string, senha: string, salarioMensal: number): Promise<Usuario> {
    const password_hash = await bcrypt.hash(senha, 10);
    
    const res = await query(
      `INSERT INTO users (nome, email, password_hash, salario_mensal) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, nome, email, salario_mensal as "salarioMensal", created_at`,
      [nome, email, password_hash, salarioMensal]
    );

    return res.rows[0];
  }

  static async login(email: string, senha: string): Promise<Usuario | null> {
    const res = await query(
      `SELECT id, nome, email, password_hash, salario_mensal as "salarioMensal", created_at 
       FROM users WHERE email = $1`,
      [email]
    );

    if (res.rowCount === 0) return null;

    const user = res.rows[0];
    const match = await bcrypt.compare(senha, user.password_hash);

    if (!match) return null;

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async buscarPorId(id: string): Promise<Usuario | null> {
    const res = await query(
      `SELECT id, nome, email, salario_mensal as "salarioMensal", created_at 
       FROM users WHERE id = $1`,
      [id]
    );

    return res.rows[0] || null;
  }
}
