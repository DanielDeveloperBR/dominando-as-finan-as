import { Request, Response } from 'express';
import { Categoria } from '../types';
import { BudgetService } from '@/services/budgeService';

export class BudgetController {

  static async listar(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const { mes, ano } = BudgetService.periodoAtual();
      const limites = await BudgetService.listarComConsumo(userId, mes, ano);
      return res.json(limites);
    } catch (error) {
      console.error('Erro ao listar orçamentos:', error);
      return res.status(500).json({ error: 'Erro ao listar orçamentos' });
    }
  }

  static async definir(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const { categoria, limite_mensal } = req.body;
      const { mes, ano } = BudgetService.periodoAtual();

      const limite = await BudgetService.definirLimite(
        userId,
        categoria as Categoria,
        limite_mensal,
        mes,
        ano
      );

      return res.status(201).json(limite);
    } catch (error) {
      console.error('Erro ao definir orçamento:', error);
      return res.status(500).json({ error: 'Erro ao definir orçamento' });
    }
  }

  static async remover(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const id  = req.params.id as string

      if (!id) {
        return res.status(400).json({ error: 'ID do limite é obrigatório' });
      }

      await BudgetService.removerLimite(userId, id);
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover orçamento:', error);
      return res.status(500).json({ error: 'Erro ao remover orçamento' });
    }
  }
}