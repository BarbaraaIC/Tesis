import axios from './root.service.js';

export async function solicitarRecuperacion(correo) {
    try {
        const response = await axios.post('/auth/recuperar-password', { correo });
        return response.data;
    } catch (error) {
        const backendMessage = error.response?.data?.message || 'No se pudo enviar el correo';
        throw new Error(backendMessage, { cause: error });
    }
}

export async function restablecerPassword({ id, token, passwordNueva }) {
    try {
        const response = await axios.post('/auth/restablecer-password', { id, token, passwordNueva });
        return response.data;
    } catch (error) {
        const backendMessage = error.response?.data?.message || 'No se pudo restablecer la contraseña';
        throw new Error(backendMessage, { cause: error });
    }
}