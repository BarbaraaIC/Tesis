import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/usuarios/useAuth.jsx'
import {
  Users,
  Stethoscope,
  CalendarCheck,
  Clock,
  User,
  LogOut,
  ChevronLeft,
} from 'lucide-react'

const Sidebar = ({ colapsado, setColapsado }) => {
  const navigate = useNavigate()
  const { usuario, rol } = useAuth()
  const rolNormalizado = rol?.toLowerCase().trim()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/')
  }


  let anchoSidebar = 'w-64 max-md:w-48'
  if (colapsado) {
    anchoSidebar = 'w-20'
  }

  let rotacionBoton = ''
  if (colapsado) {
    rotacionBoton = 'rotate-180'
  }

  let clasesTitulo = 'text-xl pr-6 leading-tight break-words'
  if (colapsado) {
    clasesTitulo = 'text-center text-xs'
  }

  let textoTitulo = `Bienvenid@, ${usuario.nombre || 'usuario'}`
  if (colapsado) {
    textoTitulo = usuario.nombre?.charAt(0).toUpperCase() || 'U'
  }

  let alineacionItems = 'gap-3'
  if (colapsado) {
    alineacionItems = 'justify-center'
  }

  let gapLogout = 'gap-2'
  if (colapsado) {
    gapLogout = ''
  }

  const itemsMenu = [
    {
      nombre: 'Usuarios',
      icono: Users,
      ruta: '/usuarios',
      visible: rolNormalizado === 'administrador',
    },
    {
      nombre: 'Servicios Clínicos',
      icono: Stethoscope,
      ruta: '/servicios',
      visible:
        rolNormalizado === 'administrador' || rolNormalizado === 'profesional',
    },
    {
      nombre: 'Reservas',
      icono: CalendarCheck,
      ruta: '/reservas',
      visible: true,
    },
    {
      nombre: 'Horas',
      icono: Clock,
      ruta: '/misHoras',
      visible: true,
    },
    {
      nombre: 'Perfil',
      icono: User,
      ruta: '/perfil',
      visible: true,
    },
  ]

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#04B6B6] p-4 flex flex-col transition-all duration-300 z-40 ${anchoSidebar}`}
    >
      <button
        onClick={() => setColapsado(!colapsado)}
        className={`absolute top-6 -right-3 w-7 h-7 rounded-full bg-[#04B6B6] border-2 border-white text-white flex items-center justify-center transition-transform duration-300 z-50 ${rotacionBoton}`}
      >
        <ChevronLeft size={16} />
      </button>

      <h1
        className={`text-white font-bold mb-8 overflow-hidden transition-all duration-300 ${clasesTitulo}`}
      >
        {textoTitulo}
      </h1>

      <nav className="flex flex-col gap-1">
        {itemsMenu.map((item) => {
          if (!item.visible) {
            return null
          }

          const Icono = item.icono

          return (
            <button
              key={item.nombre}
              onClick={() => navigate(item.ruta)}
              className={`flex items-center text-white hover:bg-[#039C9C] p-2 rounded whitespace-nowrap ${alineacionItems}`}
              title={item.nombre}
            >
              <Icono size={20} className="shrink-0" />
              {!colapsado && <span>{item.nombre}</span>}
            </button>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        className={`mt-auto bg-red-400 text-white py-2 rounded-lg hover:bg-red-600 cursor-pointer flex items-center justify-center ${gapLogout}`}
        title="Cerrar sesión"
      >
        <LogOut size={18} />
        {!colapsado && <span>Cerrar sesión</span>}
      </button>
    </aside>
  )
}

export default Sidebar