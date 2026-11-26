import { Router } from 'express';
import { getReporte} from '../controllers/reportes.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/:id_usuario', authMiddleware, getReporte);

export default router;