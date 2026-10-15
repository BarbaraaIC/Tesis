import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { isAdminOrProfesional } from '../middleware/authorization.middleware.js';
import { crearTratamiento, obtenerTratamientos, obtenerTratamientoPorId, cambiarEstadoTratamiento} from '../controllers/tratamientos.controller.js';

const router = Router();

router.post('/crearTratamiento',authMiddleware, isAdminOrProfesional, crearTratamiento);
router.get('/obtenerTratamientos', authMiddleware, obtenerTratamientos);
router.get('/buscarTratamiento/:id_servicio', obtenerTratamientoPorId);
//router.delete('/desactivarTratamiento/:cod_tratamiento', authMiddleware, isAdminOrProfesional, desactivarTratamiento);
router.patch('/cambiarEstado/:cod_tratamiento', authMiddleware, isAdminOrProfesional, cambiarEstadoTratamiento);


export default router;