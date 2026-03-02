import { query } from '../config/db';
import { Transacao } from '../types';

export class FinanceiroService {
  static async listarTransacoes(userId: string): Promise<Transacao[]> {
    const res = await query(
      `SELECT id, user_id, descricao, valor, tipo, categoria, data 
       FROM transactions WHERE user_id = $1 ORDER BY data DESC`,
      [userId]
    );
    return res.rows;
  }

  static async adicionarTransacao(userId: string, dados: Omit<Transacao, 'id' | 'user_id' | 'data'>): Promise<Transacao> {
    const res = await query(
      `INSERT INTO transactions (user_id, descricao, valor, tipo, categoria) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, user_id, descricao, valor, tipo, categoria, data`,
      [userId, dados.descricao, dados.valor, dados.tipo, dados.categoria]
    );
    return res.rows[0];
  }

  static async removerTransacao(userId: string, id: string): Promise<void> {
    await query(
      `DELETE FROM transactions WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  }

  static async calcularResumo(userId: string) {
    const res = await query(
      `SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'RECEITA' THEN valor ELSE 0 END), 0) as receita,
        COALESCE(SUM(CASE WHEN tipo = 'DESPESA' THEN valor ELSE 0 END), 0) as despesa
       FROM transactions WHERE user_id = $1`,
      [userId]
    );

    const { receita, despesa } = res.rows[0];
    const saldo = parseFloat(receita) - parseFloat(despesa);

    return {
      receitaTotal: parseFloat(receita),
      despesaTotal: parseFloat(despesa),
      saldoTotal: saldo
    };
  }
}
