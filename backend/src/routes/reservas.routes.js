import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { isAdmin, isAdminOrProfesional } from '../middleware/authorization.middleware.js';
import { crearReserva , getReservasPorProfesional, getDisponibilidadPorProfesional, 
    getReservasPorUsuario, cancelarReserva, getReservas} from '../controllers/reservas.controller.js';

const router = Router();
router.get('/porUsuario/:id_usuario', getReservasPorUsuario);
router.post('/crearReserva', authMiddleware, crearReserva);
router.get('/porProfesional/:id_profesional', authMiddleware,getReservasPorProfesional);
router.get('/disponibilidad/:id_profesional', getDisponibilidadPorProfesional);
router.delete('/eliminarReserva/:cod_reserva', cancelarReserva);
router.get('/reservasTodas', authMiddleware, isAdmin, getReservas);

export default router;

