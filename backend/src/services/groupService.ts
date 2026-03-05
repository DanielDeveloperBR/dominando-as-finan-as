import { query } from "@/config/db";

export class GroupService {

  async createGroup(nome: string, ownerId: string) {
    const group = await query(`INSERT INTO groups (nome) VALUES ($1) RETURNING *`, [nome]);

    await query(`INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'OWNER')`, [group.rows[0].id, ownerId]);

    return group.rows[0];
  }

  async addMember(groupId: string, userId: string) {
    return query(`INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)`, [groupId, userId]);
  }

  async getGroupTransactions(groupId: string) {
    return query(`SELECT * FROM transactions WHERE group_id = $1`, [groupId]);
  }
}