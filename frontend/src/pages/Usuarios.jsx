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
    <div className="max-w-7xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Búsqueda de Usuarios</h2>

      <div className="relative mb-6 max-w-sm">
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
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#505FB6] focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#04B6B6] text-left text-black-500 uppercase text-xs tracking-wide">
              <th className="p-3 font-semibold">RUT</th>
              <th className="p-3 font-semibold">Nombre</th>
              <th className="p-3 font-semibold">Apellido</th>
              <th className="p-3 font-semibold">Teléfono</th>
              <th className="p-3 font-semibold">Correo</th>
            </tr>
          </thead>
          <tbody>
            {usuariosVisibles.map((u, index) => {
              let filaClase = 'border-t border-gray-100 hover:bg-[#505FB6]/5 transition-colors'
              if (index % 2 === 1) {
                filaClase = 'border-t border-gray-100 bg-gray-50/50 hover:bg-[#505FB6]/5 transition-colors'
              }

              return (
                <tr key={u.id_usuario} className={filaClase}>
                  <td className="p-3 text-gray-600">{u.rut}</td>
                  <td className="p-3 text-gray-800">{u.nombre}</td>
                  <td className="p-3 text-gray-800">{u.apellido}</td>
                  <td className="p-3 text-gray-600">{u.telefono}</td>
                  <td className="p-3 text-gray-600">{u.correo}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {usuariosVisibles.length === 0 && (
          <p className="p-6 text-center text-gray-400 text-sm">No se encontraron usuarios.</p>
        )}
      </div>
    </div>
  )
}

export default Usuarios