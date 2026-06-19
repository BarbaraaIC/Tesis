import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { isAdminOrProfesional } from '../middleware/authorization.middleware.js';
import { crearServicio, editarServicio, eliminarServicio, obtenerServicios } from '../controllers/servicios.controller.js';

const router = Router();

router.post('/crearServicio', authMiddleware, isAdminOrProfesional, crearServicio);
router.patch('/editarServicio/:id_servicio', authMiddleware, isAdminOrProfesional, editarServicio);
router.get('/buscarServicio', obtenerServicios)
router.delete('/eliminarServicio/:tipo_servicio',authMiddleware, isAdminOrProfesional, eliminarServicio);

export default router;

