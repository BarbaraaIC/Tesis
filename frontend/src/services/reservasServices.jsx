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