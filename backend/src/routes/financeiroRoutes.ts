import { Router } from 'express';
import { FinanceiroController } from '../controllers/financeiroController';
import { sessionAuthMiddleware } from '@/middlewares/authMiddleware';
import { validate } from '@/middlewares/validate';
import { transacaoSchema } from '@/schemas/transacaoSchema';

const router = Router();
router.use(sessionAuthMiddleware);

router.get('/listarFinanceiro', FinanceiroController.listar);
router.post('/adicionarFinanceiro', validate(transacaoSchema), FinanceiroController.adicionar);
router.delete('/:id', FinanceiroController.remover);
router.get('/resumo', FinanceiroController.resumo);
router.post('/analisar', FinanceiroController.analisar);
router.get('/summary', FinanceiroController.summary)
router.get('/historico-score', FinanceiroController.historico);

export default router;