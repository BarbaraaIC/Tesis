import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/usuarios/useAuth.jsx'
import { getUsuarios } from '../services/usuariosServices.jsx'

const Usuarios = () => {
  const { token, rol } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const cargarUsuarios = async () => {
      try {
        const data = await getUsuarios(token)
        setUsuarios(data.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    cargarUsuarios()
  }, [token])

  if (loading) return <p>Cargando usuarios...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (rol === 'paciente') return <p>No tienes permisos para ver esta sección.</p>


  const usuariosPorRol =
    rol === 'administrador' ? usuarios : usuarios.filter((u) => u.rol === 'paciente')


  const normalizar = (str) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')


  const texto = normalizar(busqueda)
  const usuariosVisibles = usuariosPorRol.filter((u) =>
    normalizar(`${u.nombre} ${u.apellido}`).includes(texto)
  )

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Búsqueda de Usuarios</h2>

      <div className="relative mb-4 max-w-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
          />
        </svg>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre y apellido"
          className="w-full pl-9 pr-3 py-2 border rounded-lg"
        />
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">RUT</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Apellido</th>
            <th className="p-2">Teléfono</th>
            <th className="p-2">Correo</th>
          </tr>
        </thead>
        <tbody>
          {usuariosVisibles.map((u) => (
            <tr key={u.id_usuario} className="border-b hover:bg-gray-50">
              <td className="p-2">{u.rut}</td>
              <td className="p-2">{u.nombre}</td>
              <td className="p-2">{u.apellido}</td>
              <td className="p-2">{u.telefono}</td>
              <td className="p-2">{u.correo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Usuarios