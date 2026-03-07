import { Request, Response } from "express";
import { GroupService } from "../services/groupService";

const groupService = new GroupService();

export class GroupController {

  static async criarGrupo(req: Request, res: Response) {

    try {

      const userId = (req.session as any).userId;

      if (!userId) {
        return res.status(401).json({ error: "Usuário não autenticado" });
      }

      const { nome } = req.body;

      if (!nome || nome.trim().length < 3) {
        return res.status(400).json({ error: "Nome do grupo inválido" });
      }

      const grupo = await groupService.createGroup(nome.trim(), userId);

      return res.status(201).json(grupo);

    } catch (error) {

      console.error("Erro ao criar grupo:", error);

      return res.status(500).json({
        error: "Erro ao criar grupo"
      });

    }

  }

  static async adicionarMembro(req: Request, res: Response){
    const groupId = req.params.groupId as string
    const {userId} = req.body

    if (!userId) {
      return res.status(400).json({ error: "Sem user!" });
    }

    try {
      
      const membro = await groupService.addMember(groupId, userId);

      if (!membro) {
        return res.status(400).json({ error: "Membro já adicionado ou grupo inexistente!" });
      }

      res.status(201).json(membro);
    } catch (error) {
      console.error("erro ao add membro: ", error)
      res.status(500).json({ error: "Erro ao adicionar membro!" })
    }
  }

  static async listarMembros(req: Request, res: Response){
    const groupId = req.params.groupId as string

    try {
      const membros = await groupService.listMembers(groupId)

      res.json(membros)
    } catch (error) {
      console.error("erro ao listar membros: ", error)
      res.status(500).json({ error: "Erro ao listar membros!" })
    }
  }

  static async listarTransacoes(req: Request, res: Response){
    const groupId = req.params.groupId as string

    try {
      const transacoes = await groupService.getGroupTransactions(groupId)

      res.json(transacoes)
    } catch (error) {
      console.error("erro ao listar transações: ", error)
      res.status(500).json({ error: "Erro ao listar transações!" })
    }
  }

}