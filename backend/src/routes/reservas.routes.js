import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { isAdmin, isAdminOrProfesional } from '../middleware/authorization.middleware.js';
import { crearReserva , getReservasPorProfesional, getReservasPorUsuario} from '../controllers/reservas.controller.js';

const router = Router();
router.get('/porUsuario/:id_usuario', getReservasPorUsuario);
router.post('/crearReserva', authMiddleware, crearReserva);
router.get('/porProfesional/:id_profesional', authMiddleware, isAdminOrProfesional, getReservasPorProfesional);

export default router;