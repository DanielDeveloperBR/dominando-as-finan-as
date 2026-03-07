import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const router = Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.me);
router.get('/buscar', AuthController.buscarPorEmail);

export default router;