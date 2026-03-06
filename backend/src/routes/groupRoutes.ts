import { GroupController } from '@/controllers/groupController';
import { Router } from 'express';

const router = Router();

router.post('/criar-grupo', GroupController.criarGrupo)

export default router;