import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usuarioRoutes from './usuario.routes.js';
import servicioRoutes from './servicio.routes.js';
import tratamientoRoutes from './tratamiento.routes.js';
import tratamientoAsigRoutes from './tratamientoAsignado.routes.js'

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/servicios', servicioRoutes);
router.use('/tratamientos', tratamientoRoutes);
router.use('/tratamientosAsig', tratamientoAsigRoutes);
export default router;