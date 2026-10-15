import axios from './root.service.js';

export async function getServicios() {
  try {
    const response = await axios.get('/servicios/buscarServicio');
    return response.data;
  } catch (error) {
    const backendMessage = error.response?.data?.message ||
      'Error al obtener servicios';
    throw new Error(backendMessage, { cause: error });
  }
}

export async function crearServicio(servicio) {
  try {
    const response = await axios.post('/servicios/crearServicio', servicio);
    return response.data;
  } catch (error) {
    const backendMessage = error.response?.data?.message ||
      'Error al crear el servicio';
    throw new Error(backendMessage, { cause: error });
  }
}

export async function desactivarServicio(id_servicio) {
  try {
    const response = await axios.delete(`/servicios/desactivarServicio/${id_servicio}`);
    return response.data;
  } catch (error) {
    const backendMessage = error.response?.data?.message ||
      'Error al desactivar el servicio';
    throw new Error(backendMessage, { cause: error });
  }
}

/*export async function cambiarEstadoServicio(id_servicio) {
  try {
    const response = await axios.patch(`/servicios/cambiarEstado/${id_servicio}`);
    return response.data;
  } catch (error) {
    const backendMessage = error.response?.data?.message || 'Error al cambiar el estado del servicio';
    throw new Error(backendMessage, { cause: error });
  }
}
*/