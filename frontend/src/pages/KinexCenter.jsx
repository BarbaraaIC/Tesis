import { useNavigate } from 'react-router-dom'

function KinexCenter() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

    const handleLogout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      navigate('/')
    }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#04B6B6]">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          Bienvenid@, {usuario.nombre || 'usuario'}
        </h1>
        
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors cursor-pointer"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export default KinexCenter
