import axios from './root.service.js';

export async function crearReserva(reserva) {
    try {
        const response = await axios.post('/reservas/crearReserva', reserva);
        return response.data;
    } catch (error) {
        const backendMessage = error.response?.data?.message || 'Error al crear la reserva';
        throw new Error(backendMessage, { cause: error });
    }
}

export async function getReservasPorUsuario(id_usuario) {
    try {
        const response = await axios.get(`/reservas/porUsuario/${id_usuario}`);
        return response.data;
    } catch (error) {
        const backendMessage = error.response?.data?.message || 'Error al obtener las reservas agendadas';
        throw new Error(backendMessage, { cause: error });
    }
}

export async function getReservasPorProfesional(id_profesional) {
    try {
        const response = await axios.get(`/reservas/porProfesional/${id_profesional}`);
        return response.data;
    } catch (error) {
        const backendMessage = error.response?.data?.message || 'Error al obtener las reservas del profesional';
        throw new Error(backendMessage, { cause: error });
    }
}