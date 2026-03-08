import { z } from "zod"

export const transacaoSchema = z.object({

  descricao: z.string().min(2).max(255),

  valor: z.number().positive(),

  tipo: z.enum(["RECEITA", "DESPESA"]),

  categoria: z.string().min(2)
})