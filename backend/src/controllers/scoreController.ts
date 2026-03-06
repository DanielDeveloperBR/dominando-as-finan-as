import { MonthlyScoreService } from "@/services/MonthlyScoreService";
import { Request, Response } from "express";

const service = new MonthlyScoreService();

export class ScoreController {

  static async historico(req: Request, res: Response) {

    try {

      const userId = (req.session as any).userId;

      if (!userId) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const historico = await service.historico(userId);

      res.json(historico);

    } catch (error) {

      console.error("Erro ao buscar histórico:", error);

      res.status(500).json({ error: "Erro ao buscar histórico" });

    }

  }

}