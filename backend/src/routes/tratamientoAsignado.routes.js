import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { isAdminOrProfesional } from '../middleware/authorization.middleware.js';
import { asignarTratamiento, getProfesionalesPorPaciente, actualizarAsistencia } from '../controllers/tratamientoAsignado.controller.js';

const router = Router();

router.post('/asignar',authMiddleware, isAdminOrProfesional, asignarTratamiento);
router.get('/profesionalesPorPaciente/:id_usuario', authMiddleware, getProfesionalesPorPaciente);
router.patch('/actualizarAsistencia/:id_asignacion', authMiddleware, isAdminOrProfesional, actualizarAsistencia);


export default router;