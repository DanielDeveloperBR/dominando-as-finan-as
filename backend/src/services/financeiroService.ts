import { query } from '../config/db';
import { Transacao } from '../types';
import { FinanceEngine } from './financeEngine';

export class FinanceiroService {
  static async listarTransacoes(userId: string): Promise<Transacao[]> {
    const res = await query(`SELECT id, user_id, descricao, valor, tipo, categoria, data FROM transactions WHERE user_id = $1 ORDER BY data DESC`, [userId])
    return res.rows
  }

  static async adicionarTransacao(userId: string, dados: Omit<Transacao, 'id' | 'user_id' | 'data'>): Promise<Transacao> {
    if (dados.valor <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }

    const res = await query(`INSERT INTO transactions (user_id, descricao, valor, tipo, categoria) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, descricao, valor, tipo, categoria, data`, [userId, dados.descricao, dados.valor, dados.tipo, dados.categoria]);
    return res.rows[0];
  }

  static async removerTransacao(userId: string, id: string): Promise<void> {
    await query(`DELETE FROM transactions WHERE id = $1 AND user_id = $2`, [id, userId]);
  }

  static async calcularResumo(userId: string) {
    const res = await query(`SELECT COALESCE(SUM(CASE WHEN tipo = 'RECEITA' THEN valor ELSE 0 END), 0) as receita, COALESCE(SUM(CASE WHEN tipo = 'DESPESA' THEN valor ELSE 0 END), 0) as despesa FROM transactions WHERE user_id = $1`, [userId]);

    const { receita, despesa } = res.rows[0];
    const saldo = parseFloat(receita) - parseFloat(despesa);

    return {
      receitaTotal: parseFloat(receita),
      despesaTotal: parseFloat(despesa),
      saldoTotal: saldo
    };
  }

  static async getSummaryCompleto(userId: string) {

    const userRes = await query(`SELECT salario_mensal FROM users WHERE id = $1`, [userId])

    const salarioMensal = Number(userRes.rows[0]?.salario_mensal || 0);

    if (salarioMensal <= 0) {
      return { error: 'Defina seu salário mensal para gerar o score.' }
    }

    const transacoesRes = await query(`SELECT valor, tipo, data FROM transactions WHERE user_id = $1`, [userId]);

    const transacoes = transacoesRes.rows;

    const summary = FinanceEngine.calculate(salarioMensal, transacoes);

    // 📈 salvar histórico mensal
    const now = new Date();
    const ano = now.getFullYear();
    const mes = now.getMonth() + 1;

    await query(`
    INSERT INTO monthly_scores (user_id, ano, mes, score, saldo_previsto)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id, ano, mes) DO UPDATE SET score = EXCLUDED.score, saldo_previsto = EXCLUDED.saldo_previsto
  `, [userId, ano, mes, summary.score, summary.saldoPrevisto]);

    return summary;
  }

  static async getHistoricoScore(userId: string) {
    const res = await query(`SELECT ano, mes, score, saldo_previsto FROM monthly_scores WHERE user_id = $1 ORDER BY ano DESC, mes DESC`, [userId]);

    return res.rows;
  }

  static async getGroupScore(groupId: string) {

    const salarioRes = await query(`
    SELECT COALESCE(SUM(u.salario_mensal),0) as total_salario
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = $1
  `, [groupId]);

    const salarioTotal = Number(salarioRes.rows[0].total_salario);

    const transacoesRes = await query(`
    SELECT valor, tipo, data
    FROM transactions
    WHERE group_id = $1
  `, [groupId]);

    return FinanceEngine.calculate(
      salarioTotal,
      transacoesRes.rows
    );
  }

  static async getMetasComProjecao(userId: string) {

    const metasRes = await query(
      `SELECT * FROM goals WHERE user_id = $1`,
      [userId]
    );

    const resumo = await this.calcularResumo(userId);

    const userRes = await query(
      `SELECT salario_mensal FROM users WHERE id = $1`,
      [userId]
    );

    const salario = Number(userRes.rows[0].salario_mensal);

    return metasRes.rows.map(meta => ({
      ...meta,
      projecao: FinanceEngine.calculateGoalProjection(
        salario,
        resumo.despesaTotal,
        meta.valor_meta,
        meta.valor_atual
      )
    }));
  }
}