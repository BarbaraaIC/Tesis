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