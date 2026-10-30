import { Router } from 'express';
import { getHistorialPaciente, registrarSesion } from '../controllers/historialMedico.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { isAdminOrProfesional } from '../middleware/authorization.middleware.js';

const router = Router();

router.get('/:id_usuario', authMiddleware, getHistorialPaciente);
router.patch('/sesion/:cod_reserva', authMiddleware, isAdminOrProfesional, registrarSesion);

export default router;