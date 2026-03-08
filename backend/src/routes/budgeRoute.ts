import { Router } from 'express';
import { sessionAuthMiddleware } from '@/middlewares/authMiddleware';
import { validate } from '@/middlewares/validate';
import { BudgetController } from '@/controllers/budgeController';
import { budgetSchema } from '@/schemas/budgeSchema';

const router = Router();

router.use(sessionAuthMiddleware);

router.get('/', BudgetController.listar);
router.post('/', validate(budgetSchema), BudgetController.definir);
router.delete('/:id', BudgetController.remover);

export default router;