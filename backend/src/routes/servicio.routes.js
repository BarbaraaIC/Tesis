import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { isAdminOrProfesional } from '../middleware/authorization.middleware.js';
import { crearServicio } from '../controllers/servicios.controller.js';

const router = Router();

router.post('/crearServicio', authMiddleware, isAdminOrProfesional, crearServicio);

export default router;

