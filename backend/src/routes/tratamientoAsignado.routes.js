import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { isAdminOrProfesional } from '../middleware/authorization.middleware.js';
import { asignarTratamiento } from '../controllers/tratamientoAsignado.controller.js';

const router = Router();

router.post('/asignar',authMiddleware, isAdminOrProfesional, asignarTratamiento);


export default router;