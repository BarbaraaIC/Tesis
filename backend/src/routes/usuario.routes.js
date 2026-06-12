import { Router } from 'express';
import { crearUsuario, obtenerUsuarios, cambiarRolUsuario } from '../controllers/usuarios.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/authorization.middleware.js';

const router = Router();

router.post('/', crearUsuario);
router.get('/', authMiddleware, obtenerUsuarios);
router.patch('/:id/rol', authMiddleware, isAdmin, cambiarRolUsuario);

export default router;