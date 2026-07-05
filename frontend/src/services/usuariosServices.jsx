const API_URL = 'http://localhost:3000/api/usuarios'

export async function getUsuarios(token) {
    const response = await fetch(`${API_URL}`, {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error('Error al obtener usuarios')
    }

    return response.json()
}