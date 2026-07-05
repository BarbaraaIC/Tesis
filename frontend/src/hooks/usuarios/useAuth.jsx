export function useAuth() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    const token = localStorage.getItem('token')

    return {
        usuario,
        token,
        rol: usuario?.rol || null,
    }
}