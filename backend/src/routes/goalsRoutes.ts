import { Router } from 'express';
import { sessionAuthMiddleware } from '@/middlewares/authMiddleware';
import { validate } from '@/middlewares/validate';
import { GoalController } from '@/controllers/goalsController';
import { criarMetaSchema, depositarMetaSchema } from '@/schemas/goalsSchema';

const router = Router();

router.use(sessionAuthMiddleware);

router.get('/', GoalController.listar);
router.post('/', validate(criarMetaSchema), GoalController.criar);
router.patch('/:id/depositar', validate(depositarMetaSchema), GoalController.depositar);
router.delete('/:id', GoalController.excluir);

export default router;