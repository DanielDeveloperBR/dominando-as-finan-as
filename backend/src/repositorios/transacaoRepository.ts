import { query } from "@/config/db"

export class TransacaoRepository {

  static async listar(userId: string) {

    const res = await query(`
      SELECT
        id,
        descricao,
        valor,
        tipo,
        categoria,
        data
      FROM transactions
      WHERE user_id = $1
      ORDER BY data DESC
    `,[userId])

    return res.rows
  }

}