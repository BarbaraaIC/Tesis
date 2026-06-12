import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import { crearUsuario} from '../controllers/usuarios.controller.js';

const router = Router();

router.post('/login', login);
router.post('/register', crearUsuario);


export default router;