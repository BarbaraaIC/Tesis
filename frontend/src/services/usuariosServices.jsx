import axios from './root.service.js';

export async function getUsuarios(token) {
    try {
        const response = await axios.get('usuarios',{
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
        
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        throw error;
    }
}

export async function actualizarUsuario(id, datos) {
    try {
        const response = await axios.patch(`/usuarios/actualizarDatos/${id}`, datos)
        return response.data
        
    } catch (error) {
        console.error("Error al actualizar datos del usuario:", error)
        throw error
    }
}

export async function cambiarRolUsuario(id, rol) {
    try {
        const response = await axios.patch(`/usuarios/${id}/rol`, { rol })
        return response.data
    } catch (error) {
        console.error("Error al actualizar el rol del usuario:", error)
        throw error
    }
}