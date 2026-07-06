import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/usuarios/useAuth.jsx'

function ProtectRoutes({ children, rolesPermitidos }) {
  const token = localStorage.getItem('token')
  const { rol } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (rolesPermitidos) {
    const rolNormalizado = rol?.toLowerCase().trim()
    if (!rolesPermitidos.includes(rolNormalizado)) {
      return <Navigate to="/kinex-center" replace />
    }
  }

  return children
}

export default ProtectRoutes