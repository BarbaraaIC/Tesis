import { Router } from 'express';
import { login, loginGoogle, registroGoogle, restablecerPassword, solicitarRecuperacion } from '../controllers/auth.controller.js';
import { crearUsuario} from '../controllers/usuarios.controller.js';

const router = Router();

router.post('/login', login);
router.post('/register', crearUsuario);
router.post("/google", loginGoogle);
router.post("/google/registro", registroGoogle);
router.post("/recuperar-password", solicitarRecuperacion);
router.post("/restablecer-password", restablecerPassword);

export default router;