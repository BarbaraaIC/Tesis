import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/usuarios/useAuth.jsx'
import { getUsuarios, cambiarRolUsuario } from '../services/usuariosServices.jsx'

const ROLES_DISPONIBLES = ['profesional', 'paciente']

const Usuarios = () => {
  const { token, rol } = useAuth()

  const [listaUsuarios, setListaUsuarios] = useState([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [mensajeError, setMensajeError] = useState(null)
  const [textoBusqueda, setTextoBusqueda] = useState('')

  const [idUsuarioEnEdicion, setIdUsuarioEnEdicion] = useState(null)
  const [rolSeleccionado, setRolSeleccionado] = useState('')

  useEffect(() => {
    const cargarListaUsuarios = async () => {
      try {
        const respuesta = await getUsuarios(token)
        setListaUsuarios(respuesta.data)
      } catch (errorCapturado) {
        setMensajeError(errorCapturado.message)
      } finally {
        setEstaCargando(false)
      }
    }
    cargarListaUsuarios()
  }, [token])

  const manejarClickEditar = (usuario) => {
    setIdUsuarioEnEdicion(usuario.id_usuario)
    setRolSeleccionado(usuario.rol)
  }

  const manejarCancelarEdicion = () => {
    setIdUsuarioEnEdicion(null)
    setRolSeleccionado('')
  }

  const manejarClickGuardar = async (usuario) => {
    if (rolSeleccionado === usuario.rol) {
      manejarCancelarEdicion()
      return
    }

    const usuarioConfirmoElCambio = window.confirm(
      `Seguro que quieres cambiar el rol de ${usuario.nombre} ${usuario.apellido} a "${rolSeleccionado}".`
    )

    if (!usuarioConfirmoElCambio) {
      return
    }

    try {
      await cambiarRolUsuario(usuario.id_usuario, rolSeleccionado)

      const listaUsuariosActualizada = listaUsuarios.map((usuarioActual) => {
        if (usuarioActual.id_usuario === usuario.id_usuario) {
          return { ...usuarioActual, rol: rolSeleccionado }
        }
        return usuarioActual
      })

      setListaUsuarios(listaUsuariosActualizada)
      manejarCancelarEdicion()
    } catch (errorCapturado) {
      console.error('Error al cambiar el rol:', errorCapturado)
      alert('No se pudo actualizar el rol. Intenta nuevamente.')
    }
  }

  const normalizarTexto = (textoOriginal) => {
    return textoOriginal
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  const obtenerClaseDeFila = (indice) => {
    const claseBase = 'border-t border-gray-100 hover:bg-[#505FB6]/5 transition-colors'

    if (indice % 2 === 1) {
      return `${claseBase} bg-gray-50/50`
    }

    return claseBase
  }

  const renderizarCeldaDeRol = (usuario) => {
    const estaEditandoEsteUsuario = idUsuarioEnEdicion === usuario.id_usuario

    if (estaEditandoEsteUsuario) {
      return (
        <td className="p-3">
          <select
            value={rolSeleccionado}
            onChange={(evento) => setRolSeleccionado(evento.target.value)}
            className="border border-gray-200 rounded-md text-sm px-2 py-1"
          >
            {ROLES_DISPONIBLES.map((rolDisponible) => (
              <option key={rolDisponible} value={rolDisponible}>
                {rolDisponible}
              </option>
            ))}
          </select>

          <button
            onClick={() => manejarClickGuardar(usuario)}
            className="ml-2 text-xs bg-[#04B6B6] text-white px-2 py-1 rounded-md"
          >
            Guardar
          </button>

          <button
            onClick={manejarCancelarEdicion}
            className="ml-2 text-xs text-gray-600 px-2 py-1"
          >
            Cancelar
          </button>
        </td>
      )
    }

    if (usuario.rol === 'administrador') {
      return <td className="p-3 text-gray-600">{usuario.rol}</td>
    }

    return (
      <td className="p-3 text-gray-600">
        {usuario.rol}
        <button
          onClick={() => manejarClickEditar(usuario)}
          className="ml-3 text-xs text-[#505FB6] hover:underline"
        >
          Editar
        </button>
      </td>
    )
  }

  if (estaCargando) {
    return <p>Cargando usuarios...</p>
  }

  if (mensajeError) {
    return <p className="text-red-500">{mensajeError}</p>
  }

  if (rol === 'paciente') {
    return <p>No tienes permisos para ver esta sección.</p>
  }

  let usuariosSegunPermiso = listaUsuarios.filter((usuario) => usuario.rol === 'paciente')
  if (rol === 'administrador') {
    usuariosSegunPermiso = listaUsuarios
  }

  const textoBusquedaNormalizado = normalizarTexto(textoBusqueda)
  const usuariosVisibles = usuariosSegunPermiso.filter((usuario) => {
    const nombreCompletoNormalizado = normalizarTexto(`${usuario.nombre} ${usuario.apellido}`)
    return nombreCompletoNormalizado.includes(textoBusquedaNormalizado)
  })

  return (
    <div className="max-w-4xl mx-auto">
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
          value={textoBusqueda}
          onChange={(evento) => setTextoBusqueda(evento.target.value)}
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
              <th className="p-3 font-semibold">Roles</th>
            </tr>
          </thead>
          <tbody>
            {usuariosVisibles.map((usuario, indice) => {
              return (
                <tr key={usuario.id_usuario} className={obtenerClaseDeFila(indice)}>
                  <td className="p-3 text-gray-600">{usuario.rut}</td>
                  <td className="p-3 text-gray-800">{usuario.nombre}</td>
                  <td className="p-3 text-gray-800">{usuario.apellido}</td>
                  <td className="p-3 text-gray-600">{usuario.telefono}</td>
                  <td className="p-3 text-gray-600">{usuario.correo}</td>
                  {renderizarCeldaDeRol(usuario)}
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