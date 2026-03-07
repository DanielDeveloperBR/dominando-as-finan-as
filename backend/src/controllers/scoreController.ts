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

      res.status(201).json(historico);

    } catch (error) {

      console.error("Erro ao buscar histórico:", error);

      res.status(500).json({ error: "Erro ao buscar histórico" });

    }

  }

  async registrar(req: Request, res: Response) {

    const { useId, ano, mes, score, saldoPreviso } = req.body

    if (!useId || !ano || !mes || score === undefined || saldoPreviso === undefined) {
      return res.status(400).json({ error: "Dados inválidos!" })
    }

    await service.registrarScore(useId, ano, mes, score, saldoPreviso)

    res.status(201).json({ message: "Score registrado com sucesso!" })
  }
}