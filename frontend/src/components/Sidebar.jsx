import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/usuarios/useAuth.jsx'

const Sidebar = () => {
  const navigate = useNavigate()
  const { usuario, rol } = useAuth()
  const rolNormalizado = rol?.toLowerCase().trim()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/')
  }

  return (
    <aside className="fixed top-0 left-0 w-64 max-md:w-48 bg-[#04B6B6] h-screen p-4 flex flex-col">
      <h1 className="text-white text-xl font-bold mb-8">
        Bienvenid@, {usuario.nombre || 'usuario'}
      </h1>

      {rolNormalizado === 'administrador' && (
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => navigate('/usuarios')}
            className="w-full text-left text-white hover:bg-[#039C9C] p-2 rounded"
          >
            Usuarios
          </button>
        </nav>
      )}

      {(rolNormalizado === 'administrador' || rolNormalizado === 'profesional') && (
        <nav className="flex flex-col gap-1">
          <button
            onClick={() => navigate('/servicios')}
            className="w-full text-left text-white hover:bg-[#039C9C] p-2 rounded"
          >
            Servicios Clínicos
          </button>
        </nav>
      )}

      <nav className="flex flex-col gap-1">
        <button
          onClick={() => navigate('/reservas')}
          className="w-full text-left text-white hover:bg-[#039C9C] p-2 rounded"
        >
          Reservas
        </button>
      </nav>

      <nav className="flex flex-col gap-1">
        <button
          onClick={() => navigate('/perfil')}
          className="w-full text-left text-white hover:bg-[#039C9C] p-2 rounded"
        >
          Perfil
        </button>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto bg-red-400 text-white py-2 rounded-lg hover:bg-red-600 cursor-pointer"
      >
        Cerrar sesión
      </button>
    </aside>
  )
}

export default Sidebar