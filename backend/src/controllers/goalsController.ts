import { Request, Response } from 'express';
import { FinanceiroService } from '../services/financeiroService';
import { GoalService } from '@/services/goalsService';

export class GoalController {

  static async listar(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;

      // Calcula sobra mensal para projetar conclusão das metas
      const resumo = await FinanceiroService.calcularResumo(userId);
      const userRes = await import('../config/db').then(m =>
        m.query(`SELECT salario_mensal FROM users WHERE id = $1`, [userId])
      );
      const salario = Number(userRes.rows[0]?.salario_mensal || 0);
      const sobraMensal = Math.max(salario + resumo.receitaTotal - resumo.despesaTotal, 0);

      const metas = await GoalService.listar(userId, sobraMensal);
      return res.json(metas);
    } catch (error) {
      console.error('Erro ao listar metas:', error);
      return res.status(500).json({ error: 'Erro ao listar metas' });
    }
  }

  static async criar(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const { titulo, valor_meta, descricao, prazo_meses } = req.body;

      const meta = await GoalService.criar(userId, titulo, valor_meta, descricao, prazo_meses);
      return res.status(201).json(meta);
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      return res.status(500).json({ error: 'Erro ao criar meta' });
    }
  }

  static async depositar(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const id  = req.params.id as string
      const { valor } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID da meta é obrigatório' });
      }

      const meta = await GoalService.depositar(userId, id, valor);
      return res.json(meta);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao depositar';
      const status = mensagem.includes('não encontrada') ? 404 : 500;
      console.error('Erro ao depositar na meta:', error);
      return res.status(status).json({ error: mensagem });
    }
  }


  static async excluir(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const id  = req.params.id as string

      if (!id) {
        return res.status(400).json({ error: 'ID da meta é obrigatório' });
      }

      await GoalService.excluir(userId, id);
      return res.status(204).send();
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao excluir meta';
      const status = mensagem.includes('não encontrada') ? 404 : 500;
      console.error('Erro ao excluir meta:', error);
      return res.status(status).json({ error: mensagem });
    }
  }
}