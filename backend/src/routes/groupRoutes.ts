import { GroupController } from '@/controllers/groupController';
import { Router } from 'express';

const router = Router();

router.get('/meus-grupos', GroupController.listarMeusGrupos);
router.post('/criar-grupo', GroupController.criarGrupo);
router.delete('/:groupId', GroupController.excluirGrupo);
router.post('/:groupId/adicionar-membro', GroupController.adicionarMembro);
router.get('/:groupId/listar-membros', GroupController.listarMembros);
router.get('/:groupId/listar-transacoes', GroupController.listarTransacoes);
router.delete('/:groupId/membros/:membroId', GroupController.removerMembro);

export default router;