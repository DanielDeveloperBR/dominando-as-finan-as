import pool, { query } from "@/config/db";

export class GroupService {

  async createGroup(nome: string, ownerId: string) {

    const client = await pool.connect();

    try {

      await client.query("BEGIN");

      const groupResult = await client.query(`INSERT INTO groups (nome) VALUES ($1) RETURNING *`, [nome]);

      const group = groupResult.rows[0];

      await client.query(`INSERT INTO group_members (group_id, user_id, role) VALUES ($1,$2,'OWNER')`, [group.id, ownerId]);

      await client.query("COMMIT");

      return group;

    } catch (err) {

      await client.query("ROLLBACK");
      throw err;

    } finally {

      client.release();

    }
  }

  async addMember(groupId: string, userId: string) {

    const member = await query(`INSERT INTO group_members (group_id, user_id) VALUES ($1, $2) ON CONFLICT (group_id, user_id) DO NOTHING RETURNING *`, [groupId, userId]);

    return member.rows[0];
  }


  async listMembers(groupId: string) {

    const result = await query(`SELECT u.id, u.nome, u.email, gm.role FROM group_members gm JOIN users u ON u.id = gm.user_id WHERE gm.group_id = $1`, [groupId]);

    return result.rows;
  }

  async getGroupTransactions(groupId: string) {
    // Busca transações de TODOS os membros do grupo (por user_id),
    // não apenas as com group_id preenchido — transações pessoais são vinculadas
    // ao grupo pela relação de membership, não por coluna direta.
    const result = await query(
      `SELECT t.id, t.user_id, t.descricao, t.valor, t.tipo, t.categoria, t.data,
              u.nome AS membro_nome
       FROM transactions t
       JOIN group_members gm ON gm.user_id = t.user_id
       JOIN users u ON u.id = t.user_id
       WHERE gm.group_id = $1
       ORDER BY t.data DESC`,
      [groupId]
    );

    return result.rows;
  }

  async excluirGrupo(groupId: string, solicitanteId: string): Promise<void> {
    // Verificar se o solicitante é OWNER — apenas OWNER pode excluir o grupo
    const permissaoRes = await query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, solicitanteId]
    );

    if (permissaoRes.rows.length === 0 || permissaoRes.rows[0].role !== 'OWNER') {
      throw new Error('Apenas o dono do grupo pode excluir o grupo');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Remove todos os membros primeiro (FK)
      await client.query(`DELETE FROM group_members WHERE group_id = $1`, [groupId]);

      // Desvincula transações do grupo sem deletar as transações pessoais
      await client.query(`UPDATE transactions SET group_id = NULL WHERE group_id = $1`, [groupId]);

      // Remove o grupo
      await client.query(`DELETE FROM groups WHERE id = $1`, [groupId]);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async listarGruposDoUsuario(userId: string) {

    const result = await query(
      `SELECT g.id, g.nome, gm.role
       FROM groups g
       JOIN group_members gm ON gm.group_id = g.id
       WHERE gm.user_id = $1
       ORDER BY g.nome ASC`,
      [userId]
    );

    return result.rows;
  }

  async removerMembro(groupId: string, membroId: string, solicitanteId: string) {

    // Verificar se o solicitante é OWNER do grupo
    const permissaoRes = await query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, solicitanteId]
    );

    if (permissaoRes.rows.length === 0 || permissaoRes.rows[0].role !== 'OWNER') {
      throw new Error('Apenas o dono do grupo pode remover membros');
    }

    // OWNER não pode remover a si mesmo
    if (membroId === solicitanteId) {
      throw new Error('O dono do grupo não pode remover a si mesmo');
    }

    await query(
      `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, membroId]
    );
  }
}