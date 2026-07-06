import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { isAdminOrProfesional } from '../middleware/authorization.middleware.js';
import { crearTratamiento, obtenerTratamientos, obtenerTratamientoPorId} from '../controllers/tratamientos.controller.js';

const router = Router();

router.post('/crearTratamiento',authMiddleware, isAdminOrProfesional, crearTratamiento);
router.get('/obtenerTratamientos', authMiddleware, obtenerTratamientos);
router.get('/buscarTratamiento/:cod_tratamiento', authMiddleware, obtenerTratamientoPorId);


export default router;