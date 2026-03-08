import { z } from 'zod';

export const criarMetaSchema = z.object({
  titulo: z
    .string({ error: 'Título é obrigatório' })
    .min(3, { message: 'Título deve ter pelo menos 3 caracteres' })
    .max(255),
  valor_meta: z
    .number({ error: 'Valor da meta deve ser um número' })
    .positive({ message: 'Valor da meta deve ser maior que zero' })
    .max(9999999.99),
  descricao: z.string().max(500).optional(),
  prazo_meses: z.number().int().positive().max(600).optional(),
});

export const depositarMetaSchema = z.object({
  valor: z
    .number({ error: 'Valor deve ser um número' })
    .positive({ message: 'Valor do depósito deve ser maior que zero' })
    .max(9999999.99),
});