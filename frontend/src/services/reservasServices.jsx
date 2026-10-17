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

export async function getReservas() {
    try {
        const response = await axios.get('reservas/reservasTodas');
        return response.data;
    } catch (error) {
        const backendMessage = error.response?.data?.message || 'Error al obtener todas las reservas';
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

export const getDisponibilidadPorProfesional = async (id_profesional) => {
  try {
    const response = await axios.get(`/reservas/disponibilidad/${id_profesional}`);
    return response.data;
  } catch (error) {
    const backendMessage = error.response?.data?.message || 'Error al obtener la disponibilidad del profesional';
    throw new Error(backendMessage, { cause: error });
  }
};

export const cancelarReserva = async (id_reserva) => {
    try {
        const response = await axios.delete(`/reservas/cancelar/${id_reserva}`);
        return response.data;
    }
    catch (error) {
        const backendMessage = error.response?.data?.message || 'Error al cancelar la reserva';
        throw new Error(backendMessage, { cause: error });
    }
}