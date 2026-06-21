import { useNavigate } from 'react-router-dom'

const Sidebar = () => {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/')
  }

  return (
    <aside className="fixed top-0 left-0 w-64 max-md:w-48 bg-[#505FB6] h-screen p-4 flex flex-col">
      <h1 className="text-white text-xl font-bold mb-8">
        Bienvenid@, {usuario.nombre || 'usuario'}
      </h1>
      <nav className="flex flex-col gap-1">
        <button
          onClick={() => navigate('')}
          className="w-full text-left text-white hover:bg-[#28305A] p-2 rounded"
        >
          Usuarios
        </button>
      </nav>
      <nav className="flex flex-col gap-1">
        <button
          onClick={() => navigate('')}
          className="w-full text-left text-white hover:bg-[#28305A] p-2 rounded"
        >
          Tratamientos
        </button>
      </nav>
      <nav className="flex flex-col gap-1">
        <button
          onClick={() => navigate('')}
          className="w-full text-left text-white hover:bg-[#28305A] p-2 rounded"
        >
          Reservas
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
