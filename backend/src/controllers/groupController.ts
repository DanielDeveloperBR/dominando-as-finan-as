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

}