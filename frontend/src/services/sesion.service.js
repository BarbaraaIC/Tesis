
export const guardarSesion = ({ token, user }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(user || {}))
    return sessionStorage.getItem('pendingReserva') ? '/reservas' : '/kinex-center'
}