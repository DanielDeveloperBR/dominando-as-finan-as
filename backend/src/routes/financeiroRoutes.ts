import { Router } from 'express';
import { FinanceiroController } from '../controllers/financeiroController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/', FinanceiroController.listar);
router.post('/', FinanceiroController.adicionar);
router.delete('/:id', FinanceiroController.remover);
router.get('/resumo', FinanceiroController.resumo);
router.post('/analisar', FinanceiroController.analisar);

export default router;
