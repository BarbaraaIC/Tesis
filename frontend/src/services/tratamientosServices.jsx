import axios from './root.service.js';

export async function getTratamientosPorServicio(id_servicio) {
    try {
        const response = await axios.get(`/tratamientos/buscarTratamiento/${id_servicio}`);
        return response.data;
    } catch (error) {
    const backendMessage = error.response?.data?.message ||
        'Error al obtener tratamientos';
    throw new Error(backendMessage, { cause: error });
    }
}

export async function crearTratamiento(tratamiento) {
    try {
        const response = await axios.post('/tratamientos/crearTratamiento', tratamiento);
        return response.data;
    }catch (error) {
        const backendMessage = error.response?.data?.message ||
        'Error al crear el tratamiento';
        throw new Error(backendMessage, { cause: error });
    }
}

export async function eliminarTratamiento(cod_tratamiento) {
    try {
        const response = await axios.delete(`/tratamientos/eliminarTratamiento/${cod_tratamiento}`);
        return response.data;
    } catch (error) {
        const backendMessage = error.response?.data?.message ||
        'Error al eliminar el tratamiento';
        throw new Error(backendMessage, { cause: error });
    }
}

export async function cambiarEstadoTratamiento(cod_tratamiento) {
    try {
        const response = await axios.patch(`/tratamientos/cambiarEstado/${cod_tratamiento}`);
        return response.data;
    } catch (error) {
        const backendMessage = error.response?.data?.message ||
        'Error al cambiar el estado del tratamiento';
        throw new Error(backendMessage, { cause: error });
    }
}