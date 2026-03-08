import { query } from '../config/db';
import { Categoria } from '../types';

export interface LimiteOrcamento {
  id: string;
  categoria: Categoria;
  limite_mensal: number;
  mes: number;
  ano: number;
}

export interface ConsumoOrcamento extends LimiteOrcamento {
  gasto_atual: number;
  percentual: number;        // 0-100
  valor_restante: number;
  dias_no_mes: number;
  dia_atual: number;
  ritmo_projetado: number;   // quanto vai gastar até fim do mês no ritmo atual
  vai_estourar: boolean;
}

export class BudgetService {

  static periodoAtual() {
    const now = new Date();
    return { mes: now.getMonth() + 1, ano: now.getFullYear() };
  }

  /**
   * Define ou atualiza o limite de uma categoria para o mês/ano informado.
   * Usa UPSERT para idempotência — chamar duas vezes com o mesmo par
   * (user_id, categoria, mes, ano) apenas atualiza o valor.
   */
  static async definirLimite(
    userId: string,
    categoria: Categoria,
    limiteMensal: number,
    mes: number,
    ano: number
  ): Promise<LimiteOrcamento> {
    const res = await query(
      `INSERT INTO budget_limits (user_id, categoria, limite_mensal, mes, ano)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, categoria, mes, ano)
       DO UPDATE SET limite_mensal = EXCLUDED.limite_mensal
       RETURNING id, categoria, limite_mensal, mes, ano`,
      [userId, categoria, limiteMensal, mes, ano]
    );

    return res.rows[0];
  }

  /**
   * Lista todos os limites do período com consumo real calculado em uma única query
   * (sem N+1 — JOIN com SUM agregado).
   */
  static async listarComConsumo(
    userId: string,
    mes: number,
    ano: number
  ): Promise<ConsumoOrcamento[]> {
    const res = await query(
      `SELECT
         bl.id,
         bl.categoria,
         bl.limite_mensal,
         bl.mes,
         bl.ano,
         COALESCE(SUM(t.valor), 0) AS gasto_atual
       FROM budget_limits bl
       LEFT JOIN transactions t
         ON t.user_id = bl.user_id
         AND t.categoria = bl.categoria
         AND t.tipo = 'DESPESA'
         AND EXTRACT(MONTH FROM t.data) = bl.mes
         AND EXTRACT(YEAR FROM t.data) = bl.ano
       WHERE bl.user_id = $1
         AND bl.mes = $2
         AND bl.ano = $3
       GROUP BY bl.id, bl.categoria, bl.limite_mensal, bl.mes, bl.ano
       ORDER BY bl.categoria ASC`,
      [userId, mes, ano]
    );

    const now = new Date();
    const diasNoMes = new Date(ano, mes, 0).getDate();
    const diaAtual = now.getDate();

    return res.rows.map(row => {
      const gastoAtual = Number(row.gasto_atual);
      const limiteMensal = Number(row.limite_mensal);
      const percentual = limiteMensal > 0 ? Math.min((gastoAtual / limiteMensal) * 100, 100) : 0;
      const valorRestante = Math.max(limiteMensal - gastoAtual, 0);
      // Projeta o gasto total no ritmo diário atual
      const gastoDiario = diaAtual > 0 ? gastoAtual / diaAtual : 0;
      const ritmoProjetado = gastoDiario * diasNoMes;
      const vaiEstourar = ritmoProjetado > limiteMensal;

      return {
        id: row.id,
        categoria: row.categoria as Categoria,
        limite_mensal: limiteMensal,
        mes: row.mes,
        ano: row.ano,
        gasto_atual: gastoAtual,
        percentual: Math.round(percentual * 10) / 10,
        valor_restante: valorRestante,
        dias_no_mes: diasNoMes,
        dia_atual: diaAtual,
        ritmo_projetado: Math.round(ritmoProjetado * 100) / 100,
        vai_estourar: vaiEstourar,
      };
    });
  }

  static async removerLimite(userId: string, limiteId: string): Promise<void> {
    await query(
      `DELETE FROM budget_limits WHERE id = $1 AND user_id = $2`,
      [limiteId, userId]
    );
  }
}