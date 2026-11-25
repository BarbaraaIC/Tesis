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

export async function iniciarSesion(correo, password) {
    try {
        const response = await axios.post('/auth/login', { correo, password });
        return response.data;
    } catch (error) {
        const backendMessage = error.response?.data?.message || 'Error al iniciar sesión, la contraseña o el correo no es el correcto.';
        throw new Error(backendMessage, { cause: error });
    }
}

export async function iniciarSesionConGoogle(credential) {
    try {
        const response = await axios.post('/auth/google', { credential });
        return response.data;
    } catch (error) {
        const backendMessage = error.response?.data?.message || 'No se pudo iniciar sesión con Google.';
        throw new Error(backendMessage, { cause: error });
    }
}

export async function registrarUsuario(datos) {
    try {
        const response = await axios.post('/auth/register', datos);
        return response.data;
    } catch (error) {
        const backendMessage = error.response?.data?.message || 'Error al registrar.';
        throw new Error(backendMessage, { cause: error });
    }
}

export async function registrarUsuarioConGoogle(datos) {
    try {
        const response = await axios.post('/auth/google/registro', datos);
        return response.data;
    } catch (error) {
        const backendMessage = error.response?.data?.message || 'Error al registrar.';
        throw new Error(backendMessage, { cause: error });
    }
}