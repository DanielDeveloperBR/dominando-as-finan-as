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

      const key = req.headers['idempotency-key'] as string;

      if (!key){
        return res.status(400).json({error: "Chave inválida!"})
      }

      if (!descricao || !valor || !tipo || !categoria) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
      }

      if (valor <= 0) {
        return res.status(400).json({ message: "Valor deve ser maior que zero" });
      }

      const transacao = await FinanceiroService.adicionarTransacao(userId, {descricao, valor, tipo, categoria}, key);

      res.status(201).json(transacao);
    } catch (error) {
      console.error('Erro ao adicionar:', error);
      res.status(500).json({ error: 'Erro ao adicionar transação' });
    }
  }

  static async remover(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;

      const idParam = req.params.id;

      if (!idParam || Array.isArray(idParam)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      await FinanceiroService.removerTransacao(userId, idParam);

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
  static async summary(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const summary = await FinanceiroService.getSummaryCompleto(userId);

      res.json(summary);

    } catch (error) {
      console.error('Erro ao gerar summary:', error);
      res.status(500).json({ error: 'Erro ao gerar summary' });
    }
  }

  static async historico(req: Request, res: Response) {
    try {
      const userId = (req.session as any).userId;
      const historico = await FinanceiroService.getHistoricoScore(userId);
      res.json(historico);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
  }
}
