import { GroupController } from '@/controllers/groupController';
import { Router } from 'express';

const router = Router();

router.post('/criar-grupo', GroupController.criarGrupo)
router.post('/adicionar-membro', GroupController.adicionarMembro)
router.post('/listar-membro', GroupController.listarMembros)
router.post('/listar-transacao', GroupController.listarTransacoes)

export default router;