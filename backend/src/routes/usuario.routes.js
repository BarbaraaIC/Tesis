import { Router } from 'express';
import { crearUsuario } from '../controllers/usuarios.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', crearUsuario);
router.get('/', authMiddleware, obtenerUsuarios);

export default router;