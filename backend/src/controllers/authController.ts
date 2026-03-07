import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const { nome, email, senha, salarioMensal } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
      }

      await AuthService.registrar(nome, email, senha, salarioMensal || 0);

      res.status(201).json({ message: "Usuário criado com sucesso" });
    } catch (error: any) {
      console.error('Erro no signup:', error);
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao realizar cadastro' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;
      const user = await AuthService.login(email, senha);
      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      (req.session as any).userId = user.id;
      res.json(user);
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro ao realizar login' });
    }
  }

  static async logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao realizar logout' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout realizado com sucesso' });
    });
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const user = await AuthService.buscarPorId(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(user);
    } catch (error) {
      console.error("Erro no me: ", error)
    }
  }

  static async buscarPorEmail(req: Request, res: Response) {
    try {
      const sessionUserId = (req.session as any).userId;
      if (!sessionUserId) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email é obrigatório' });
      }

      const usuarioEncontrado = await AuthService.buscarPorEmail(email.trim());

      if (!usuarioEncontrado) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json(usuarioEncontrado);
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }
}