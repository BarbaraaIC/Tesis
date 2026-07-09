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