import axios from './root.service.js';

export async function asignarTratamiento(asignacion) {
  try {
    const response = await axios.post('/tratamientosAsig/asignar', asignacion);
    return response.data;
  } catch (error) {
    const backendMessage = error.response?.data?.message || 'Error al asignar el tratamiento';
    throw new Error(backendMessage, { cause: error });
  }
}

export async function getProfesionalesPorPaciente(id_usuario) {
  try {
    const response = await axios.get(`/tratamientosAsig/profesionalesPorPaciente/${id_usuario}`);
    return response.data;
  } catch (error) {
    const backendMessage = error.response?.data?.message || 'Error al obtener los profesionales';
    throw new Error(backendMessage, { cause: error });
  }
}