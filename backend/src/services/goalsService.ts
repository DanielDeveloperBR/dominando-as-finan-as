import { query } from '../config/db';

export interface Meta {
  id: string;
  titulo: string;
  descricao: string | null;
  valor_meta: number;
  valor_atual: number;
  prazo_meses: number | null;
  status: 'ATIVA' | 'CONCLUIDA' | 'PAUSADA';
  created_at: string;
  // Calculados
  percentual_concluido: number;
  valor_restante: number;
  meses_estimados: number | null;
  status_projecao: 'NO_PRAZO' | 'ATRASADO' | 'SEM_PRAZO' | 'CONCLUIDA';
}

export class GoalService {

  /**
   * Cria nova meta de poupança.
   */
  static async criar(
    userId: string,
    titulo: string,
    valorMeta: number,
    descricao?: string,
    prazoMeses?: number
  ): Promise<Meta> {
    const res = await query(
      `INSERT INTO goals (user_id, titulo, descricao, valor_meta, prazo_meses)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, titulo, descricao ?? null, valorMeta, prazoMeses ?? null]
    );

    return this.enriquecer(res.rows[0], 0);
  }

  /**
   * Lista todas as metas ativas do usuário com projeção calculada.
   * Recebe sobra_mensal (salario - despesas do mês) para projetar conclusão.
   */
  static async listar(userId: string, sobraMensal: number): Promise<Meta[]> {
    const res = await query(
      `SELECT * FROM goals
       WHERE user_id = $1
       ORDER BY
         CASE status WHEN 'ATIVA' THEN 0 WHEN 'PAUSADA' THEN 1 ELSE 2 END,
         created_at DESC`,
      [userId]
    );

    return res.rows.map(row => this.enriquecer(row, sobraMensal));
  }

  /**
   * Deposita valor na meta. Marca como CONCLUIDA automaticamente se atingir o alvo.
   */
  static async depositar(
    userId: string,
    metaId: string,
    valor: number
  ): Promise<Meta> {
    // Busca a meta garantindo que pertence ao usuário (evita IDOR)
    const atual = await query(
      `SELECT * FROM goals WHERE id = $1 AND user_id = $2 AND status = 'ATIVA'`,
      [metaId, userId]
    );

    if (atual.rows.length === 0) {
      throw new Error('Meta não encontrada ou não está ativa');
    }

    const meta = atual.rows[0];
    const novoValor = Number(meta.valor_atual) + valor;
    const novoStatus = novoValor >= Number(meta.valor_meta) ? 'CONCLUIDA' : 'ATIVA';

    const res = await query(
      `UPDATE goals
       SET valor_atual = $1, status = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [Math.min(novoValor, Number(meta.valor_meta)), novoStatus, metaId, userId]
    );

    return this.enriquecer(res.rows[0], 0);
  }

  /**
   * Exclui uma meta (apenas se pertencer ao usuário — previne IDOR).
   */
  static async excluir(userId: string, metaId: string): Promise<void> {
    const res = await query(
      `DELETE FROM goals WHERE id = $1 AND user_id = $2`,
      [metaId, userId]
    );

    if (res.rowCount === 0) {
      throw new Error('Meta não encontrada');
    }
  }

  /**
   * Calcula campos derivados sem queries extras — todos os dados já vêm da row.
   */
  private static enriquecer(row: any, sobraMensal: number): Meta {
    const valorMeta = Number(row.valor_meta);
    const valorAtual = Number(row.valor_atual);
    const percentualConcluido = valorMeta > 0
      ? Math.min(Math.round((valorAtual / valorMeta) * 1000) / 10, 100)
      : 0;
    const valorRestante = Math.max(valorMeta - valorAtual, 0);

    let mesesEstimados: number | null = null;
    let statusProjecao: Meta['status_projecao'] = 'SEM_PRAZO';

    if (row.status === 'CONCLUIDA') {
      statusProjecao = 'CONCLUIDA';
    } else if (sobraMensal > 0 && valorRestante > 0) {
      mesesEstimados = Math.ceil(valorRestante / sobraMensal);
      if (row.prazo_meses) {
        statusProjecao = mesesEstimados <= row.prazo_meses ? 'NO_PRAZO' : 'ATRASADO';
      } else {
        statusProjecao = 'SEM_PRAZO';
      }
    }

    return {
      id: row.id,
      titulo: row.titulo,
      descricao: row.descricao,
      valor_meta: valorMeta,
      valor_atual: valorAtual,
      prazo_meses: row.prazo_meses,
      status: row.status,
      created_at: row.created_at,
      percentual_concluido: percentualConcluido,
      valor_restante: valorRestante,
      meses_estimados: mesesEstimados,
      status_projecao: statusProjecao,
    };
  }
}