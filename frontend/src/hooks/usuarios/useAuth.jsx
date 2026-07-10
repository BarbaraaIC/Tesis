import { useState } from 'react'

export function useAuth() {
    const [usuario, setUsuarioState] = useState(() => {
        return JSON.parse(localStorage.getItem('usuario') || '{}')
    })

    const token = localStorage.getItem('token')

    const setUsuario = (actualizador) => {
        setUsuarioState((prev) => {
            const nuevoUsuario = typeof actualizador === 'function'
                ? actualizador(prev)
                : actualizador

            localStorage.setItem('usuario', JSON.stringify(nuevoUsuario))
            return nuevoUsuario
        })
    }

    return {
        usuario,
        token,
        rol: usuario && usuario.rol ? usuario.rol : null,
        setUsuario,
    }
}