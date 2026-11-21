import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/usuarios/useAuth.jsx'
import { getUsuarios, cambiarRolUsuario } from '../services/usuariosServices.jsx'

const ROLES_DISPONIBLES = ['profesional', 'paciente']

const FILTROS_DE_ROL = [
  { clave: 'todos', texto: 'Todos' },
  { clave: 'paciente', texto: 'Pacientes' },
  { clave: 'profesional', texto: 'Profesionales' },
  { clave: 'administrador', texto: 'Administradores' },
]

const ESTILOS_DE_ROL = {
  administrador: 'bg-[#505FB6]/10 text-[#505FB6] ring-[#505FB6]/20',
  profesional: 'bg-[#04B6B6]/10 text-teal-700 ring-[#04B6B6]/30',
  paciente: 'bg-sky-50 text-sky-700 ring-sky-200',
}

// Lee el rol venga como texto ("Paciente"), como objeto ({ nombre }) o dentro de "roles"
const obtenerRolDeUsuario = (usuario) => {
  let valor = usuario.rol

  if (!valor && Array.isArray(usuario.roles) && usuario.roles.length > 0) {
    valor = usuario.roles[0]
  }

  if (valor && typeof valor === 'object') {
    valor = valor.nombre || valor.rol || valor.descripcion
  }

  if (typeof valor !== 'string') {
    return ''
  }

  return valor.toLowerCase().trim()
}

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1)

const obtenerIniciales = (usuario) => {
  const inicialNombre = (usuario.nombre || '').charAt(0)
  const inicialApellido = (usuario.apellido || '').charAt(0)
  return `${inicialNombre}${inicialApellido}`.toUpperCase()
}

const InsigniaDeRol = ({ rol }) => {
  const estilo = ESTILOS_DE_ROL[rol] || ESTILOS_DE_ROL.paciente

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${estilo}`}
    >
      {capitalizar(rol)}
    </span>
  )
}

const Avatar = ({ usuario }) => (
  <span
    aria-hidden="true"
    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#04B6B6]/15 text-xs font-semibold text-teal-700"
  >
    {obtenerIniciales(usuario)}
  </span>
)

const Usuarios = () => {
  const { token, rol } = useAuth()

  const [listaUsuarios, setListaUsuarios] = useState([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [mensajeError, setMensajeError] = useState(null)
  const [textoBusqueda, setTextoBusqueda] = useState('')
  const [filtroDeRol, setFiltroDeRol] = useState('todos')

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
    setRolSeleccionado(obtenerRolDeUsuario(usuario))
  }

  const manejarCancelarEdicion = () => {
    setIdUsuarioEnEdicion(null)
    setRolSeleccionado('')
  }

  const manejarClickGuardar = async (usuario) => {
    const rolActual = obtenerRolDeUsuario(usuario)

    if (rolSeleccionado === rolActual) {
      manejarCancelarEdicion()
      return
    }

    const usuarioConfirmoElCambio = window.confirm(
      `Seguro que quieres cambiar el rol de ${usuario.nombre} ${usuario.apellido} de "${rolActual}" a "${rolSeleccionado}".`
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
      .replace(/[̀-ͯ]/g, '')
  }

  const obtenerClaseDeFila = (indice) => {
    const claseBase = 'border-t border-gray-100 hover:bg-[#505FB6]/5 transition-colors'

    if (indice % 2 === 1) {
      return `${claseBase} bg-gray-50/50`
    }

    return claseBase
  }

  // Controles para cambiar el rol: muestra el rol actual y el selector del nuevo rol
  const renderizarControlesDeRol = (usuario) => {
    const rolActual = obtenerRolDeUsuario(usuario)
    const estaEditandoEsteUsuario = idUsuarioEnEdicion === usuario.id_usuario

    if (estaEditandoEsteUsuario) {
      const nuevoRolEsIgualAlActual = rolSeleccionado === rolActual

      return (
        <div className="flex flex-col gap-2 rounded-lg border border-[#505FB6]/20 bg-[#505FB6]/5 p-2.5">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Rol actual:</span>
            <InsigniaDeRol rol={rolActual} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={rolSeleccionado}
              onChange={(evento) => setRolSeleccionado(evento.target.value)}
              aria-label={`Nuevo rol para ${usuario.nombre} ${usuario.apellido}`}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#505FB6]"
            >
              {ROLES_DISPONIBLES.map((rolDisponible) => (
                <option key={rolDisponible} value={rolDisponible}>
                  {capitalizar(rolDisponible)}
                  {rolDisponible === rolActual ? ' (actual)' : ''}
                </option>
              ))}
            </select>

            <button
              onClick={() => manejarClickGuardar(usuario)}
              disabled={nuevoRolEsIgualAlActual}
              className="rounded-md bg-[#04B6B6] px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Guardar
            </button>

            <button
              onClick={manejarCancelarEdicion}
              className="px-2 py-1 text-xs text-gray-600 hover:underline"
            >
              Cancelar
            </button>
          </div>
        </div>
      )
    }

    if (rolActual === 'administrador') {
      return <InsigniaDeRol rol={rolActual} />
    }

    return (
      <div className="flex flex-wrap items-center gap-3">
        <InsigniaDeRol rol={rolActual} />
        <button
          onClick={() => manejarClickEditar(usuario)}
          className="text-xs font-medium text-[#505FB6] hover:underline"
        >
          Cambiar rol
        </button>
      </div>
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

  let usuariosSegunPermiso = listaUsuarios.filter(
    (usuario) => obtenerRolDeUsuario(usuario) === 'paciente'
  )
  if (rol === 'administrador') {
    usuariosSegunPermiso = listaUsuarios
  }

  const esAdministrador = rol === 'administrador'

  const cantidadPorRol = (clave) => {
    if (clave === 'todos') {
      return usuariosSegunPermiso.length
    }
    return usuariosSegunPermiso.filter((usuario) => obtenerRolDeUsuario(usuario) === clave).length
  }

  const textoBusquedaNormalizado = normalizarTexto(textoBusqueda)
  const usuariosVisibles = usuariosSegunPermiso.filter((usuario) => {
    const nombreCompletoNormalizado = normalizarTexto(`${usuario.nombre} ${usuario.apellido}`)
    const coincideConLaBusqueda = nombreCompletoNormalizado.includes(textoBusquedaNormalizado)
    const coincideConElFiltro =
      filtroDeRol === 'todos' || obtenerRolDeUsuario(usuario) === filtroDeRol

    return coincideConLaBusqueda && coincideConElFiltro
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Búsqueda de Usuarios</h2>
        <p className="mt-1 text-sm text-gray-500">
          {usuariosVisibles.length} de {usuariosSegunPermiso.length} usuarios
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
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

        {esAdministrador && (
          <div className="flex flex-wrap gap-2">
            {FILTROS_DE_ROL.map((filtro) => {
              const estaActivo = filtroDeRol === filtro.clave
              const clasesDelFiltro = estaActivo
                ? 'bg-[#505FB6] text-white border-[#505FB6]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#505FB6]/40'

              return (
                <button
                  key={filtro.clave}
                  onClick={() => setFiltroDeRol(filtro.clave)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${clasesDelFiltro}`}
                >
                  {filtro.texto} ({cantidadPorRol(filtro.clave)})
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#04B6B6] text-left text-white uppercase text-xs tracking-wide">
              <th className="px-4 py-3 font-semibold">Usuario</th>
              <th className="px-4 py-3 font-semibold">RUT</th>
              <th className="px-4 py-3 font-semibold">Teléfono</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuariosVisibles.map((usuario, indice) => {
              return (
                <tr key={usuario.id_usuario} className={obtenerClaseDeFila(indice)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar usuario={usuario} />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {usuario.nombre} {usuario.apellido}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{usuario.correo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{usuario.rut}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {usuario.telefono || '-'}
                  </td>
                  <td className="px-4 py-3">{renderizarControlesDeRol(usuario)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {usuariosVisibles.length === 0 && (
          <p className="p-6 text-center text-gray-400 text-sm">No se encontraron usuarios.</p>
        )}
      </div>

      <div className="lg:hidden flex flex-col gap-3">
        {usuariosVisibles.map((usuario) => (
          <div
            key={usuario.id_usuario}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-center gap-3">
              <Avatar usuario={usuario} />
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 break-words">
                  {usuario.nombre} {usuario.apellido}
                </p>
                <p className="text-sm text-gray-500">{usuario.rut}</p>
              </div>
            </div>

            <dl className="mt-3 flex flex-col gap-1 text-sm">
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-gray-400">Teléfono</dt>
                <dd className="text-gray-600 break-words min-w-0">{usuario.telefono || '-'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-gray-400">Correo</dt>
                <dd className="text-gray-600 break-all min-w-0">{usuario.correo || '-'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-gray-400">Rol</dt>
                <dd className="min-w-0 flex-1">{renderizarControlesDeRol(usuario)}</dd>
              </div>
            </dl>
          </div>
        ))}

        {usuariosVisibles.length === 0 && (
          <p className="p-6 text-center text-gray-400 text-sm">No se encontraron usuarios.</p>
        )}
      </div>
    </div>
  )
}

export default Usuarios