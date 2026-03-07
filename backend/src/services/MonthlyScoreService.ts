import { query } from "@/config/db";

export class MonthlyScoreService {

  async registrarScore(userId: string, ano: number, mes: number, score: number, saldoPrevisto: number) {

    await query(`INSERT INTO monthly_scores (user_id, ano, mes, score, saldo_previsto) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_id, ano, mes)
       DO UPDATE SET score = EXCLUDED.score, saldo_previsto = EXCLUDED.saldo_previsto`, [userId, ano, mes, score, saldoPrevisto]);

  }

  async historico(userId: string) {

    const result = await query(`SELECT ano, mes, score, saldo_previsto FROM monthly_scores WHERE user_id = $1 ORDER BY ano ASC, mes ASC`, [userId]);

    return result.rows;

  }

}