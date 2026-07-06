const API_URL = 'http://localhost:3000/api'

export async function getServicios(token) {
    const response = await fetch(`${API_URL}/servicios/buscarServicio`, {
        headers: {
        Authorization: `Bearer ${token}`,
    },
})

    if (!response.ok) {
        throw new Error('Error al obtener servicios')
    }

    return response.json()
}

export async function crearServicio(token, servicio) {
    const response = await fetch(`${API_URL}/servicios/crearServicio`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(servicio),
})

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || 'Error al crear el servicio')
    }

    return data
}