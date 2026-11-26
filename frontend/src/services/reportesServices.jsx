import axios from './root.service.js';

export async function getReporte(params) {
    try {
        const response = await axios.get('/reportes', { params });
        return response.data;
    } catch (error) {
        const backendMessage = error.response?.data?.message || 'Error al obtener el reporte';
        throw new Error(backendMessage, { cause: error });
    }
}