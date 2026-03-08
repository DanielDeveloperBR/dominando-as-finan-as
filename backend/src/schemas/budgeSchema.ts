import { z } from 'zod';

const CATEGORIAS_VALIDAS = [
  'MORADIA', 'ALIMENTACAO', 'TRANSPORTE', 'LAZER', 'SAUDE', 'SALARIO', 'OUTROS',
] as const;

// Zod v4 — opções de erro usam `error` (não errorMap) e `message` (não invalid_type_error)
export const budgetSchema = z.object({
  categoria: z.enum(CATEGORIAS_VALIDAS, { error: 'Categoria inválida' }),
  limite_mensal: z
    .number({ error: 'Limite deve ser um número' })
    .positive({ message: 'Limite deve ser maior que zero' })
    .max(999999.99, { message: 'Limite excede o valor máximo permitido' }),
});