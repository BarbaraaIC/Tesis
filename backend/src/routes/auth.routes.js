import { Router } from 'express';
import { login, loginGoogle, registroGoogle } from '../controllers/auth.controller.js';
import { crearUsuario} from '../controllers/usuarios.controller.js';

const router = Router();

router.post('/login', login);
router.post('/register', crearUsuario);
router.post("/google", loginGoogle);
router.post("/google/registro", registroGoogle);


export default router;