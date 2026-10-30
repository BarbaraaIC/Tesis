import axios from './root.service.js';

export async function cargarHistorialMedico(id_usuario) {
    try {
        const response = await axios.get(`/historialMedico/${id_usuario}`);
        return response.data;
    } catch (error) {
        const backendMessage = error.response?.data?.message || 'Error al obtener el historial médico';
        throw new Error(backendMessage, { cause: error });
    }
}

export async function registrarSesion(cod_reserva, { asistencia, observaciones }) {
    try {
        const response = await axios.patch(`/historialMedico/sesion/${cod_reserva}`, {
            asistencia,
            observaciones,
        });
        return response.data;
    } catch (error) {
        const backendMessage = error.response?.data?.message || 'Error al registrar la sesión';
        throw new Error(backendMessage, { cause: error });
    }
}