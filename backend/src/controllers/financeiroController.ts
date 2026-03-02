import { Request, Response } from 'express';
import { FinanceiroService } from '../services/financeiroService';
import { AIService } from '../services/aiService';

export class FinanceiroController {
  static async listar(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const transacoes = await FinanceiroService.listarTransacoes(userId);
      res.json(transacoes);
    } catch (error) {
      console.error('Erro ao listar:', error);
      res.status(500).json({ error: 'Erro ao listar transações' });
    }
  }

  static async adicionar(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const { descricao, valor, tipo, categoria } = req.body;
      
      if (!descricao || !valor || !tipo || !categoria) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
      }

      const transacao = await FinanceiroService.adicionarTransacao(userId, {
        descricao,
        valor,
        tipo,
        categoria
      });
      
      res.status(201).json(transacao);
    } catch (error) {
      console.error('Erro ao adicionar:', error);
      res.status(500).json({ error: 'Erro ao adicionar transação' });
    }
  }

  static async remover(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const { id } = req.params;
      await FinanceiroService.removerTransacao(userId, id);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao remover:', error);
      res.status(500).json({ error: 'Erro ao remover transação' });
    }
  }

  static async resumo(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const resumo = await FinanceiroService.calcularResumo(userId);
      res.json(resumo);
    } catch (error) {
      console.error('Erro ao resumo:', error);
      res.status(500).json({ error: 'Erro ao calcular resumo' });
    }
  }

  static async analisar(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const transacoes = await FinanceiroService.listarTransacoes(userId);
      const resumo = await FinanceiroService.calcularResumo(userId);
      
      const analise = await AIService.analisarFinancas(transacoes, resumo.saldoTotal);
      res.json(analise);
    } catch (error) {
      console.error('Erro ao analisar:', error);
      res.status(500).json({ error: 'Erro ao analisar finanças' });
    }
  }
}
