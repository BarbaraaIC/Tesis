import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { isAdmin, isAdminOrProfesional } from '../middleware/authorization.middleware.js';
import { crearReserva , getReservasPorProfesional} from '../controllers/reservas.controller.js';

const router = Router();
router.post('/crearReserva', authMiddleware, isAdminOrProfesional, crearReserva);
router.get('/porProfesional/:id_profesional', authMiddleware, isAdminOrProfesional, getReservasPorProfesional);

export default router;