import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../hooks/usuarios/useAuth.jsx'
import { getServicios, crearServicio } from '../services/serviciosServices.jsx'
import { getTratamientosPorServicio, crearTratamiento } from '../services/tratamientosServices.jsx'

const Servicios = () => {
  const { rol } = useAuth()

  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [busqueda, setBusqueda] = useState('')

  const [expandedServicio, setExpandedServicio] = useState(null)
  const [tratamientosPorServicio, setTratamientosPorServicio] = useState({})
  const [cargandoTratamientos, setCargandoTratamientos] = useState(false)

  const [mostrarModal, setMostrarModal] = useState(false)
  const [nuevoServicio, setNuevoServicio] = useState({
    tipo_servicio: '',
    descripcion: '',
  })
  const [errorModal, setErrorModal] = useState('')
  const [guardando, setGuardando] = useState(false)

  const [mostrarModalTratamiento, setMostrarModalTratamiento] = useState(false)
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null)
  const [nuevoTratamiento, setNuevoTratamiento] = useState({
    descripcion: '',
    costo: '',
  })
  const [errorModalTratamiento, setErrorModalTratamiento] = useState('')
  const [guardandoTratamiento, setGuardandoTratamiento] = useState(false)

  const [mostrarAlerta, setMostrarAlerta] = useState(false)
  const [mensajeAlerta, setMensajeAlerta] = useState('')

  const cargarServicios = useCallback(async () => {
    try {
      const data = await getServicios()
      setServicios(data.data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarServicios()
  }, [cargarServicios])

  useEffect(() => {
    if (mostrarAlerta) {
      const timer = setTimeout(() => setMostrarAlerta(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [mostrarAlerta])

const cargarTratamientosDeServicio = useCallback(async (id_servicio) => {
  setCargandoTratamientos(true)
  try {
    const data = await getTratamientosPorServicio(id_servicio)
    const tratamientosNormalizados = Array.isArray(data.data) ? data.data : [data.data]
    setTratamientosPorServicio((prev) => ({ ...prev, [id_servicio]: tratamientosNormalizados }))
  } catch {
    setTratamientosPorServicio((prev) => ({ ...prev, [id_servicio]: [] }))
  } finally {
    setCargandoTratamientos(false)
  }
}, [])

  const toggleExpandido = (id_servicio) => {
    if (expandedServicio === id_servicio) {
      setExpandedServicio(null)
      return
    }

    setExpandedServicio(id_servicio)
    if (!tratamientosPorServicio[id_servicio]) {
      cargarTratamientosDeServicio(id_servicio)
    }
  }

  const handleChange = (e) => {
    setNuevoServicio({ ...nuevoServicio, [e.target.name]: e.target.value })
  }

  const handleCrear = async (e) => {
    e.preventDefault()
    setErrorModal('')
    setGuardando(true)

    try {
      await crearServicio(nuevoServicio)
      setMostrarModal(false)
      setNuevoServicio({ tipo_servicio: '', descripcion: '' })
      await cargarServicios()
      setMensajeAlerta('Servicio creado con éxito')
      setMostrarAlerta(true)
    } catch (error) {
      setErrorModal(error.message)
    } finally {
      setGuardando(false)
    }
  }


  const abrirModalTratamiento = (id_servicio) => {
    setServicioSeleccionado(id_servicio)
    setNuevoTratamiento({ descripcion: '', costo: '' })
    setErrorModalTratamiento('')
    setMostrarModalTratamiento(true)
  }

  const handleChangeTratamiento = (e) => {
    setNuevoTratamiento({ ...nuevoTratamiento, [e.target.name]: e.target.value })
  }

  const handleCrearTratamiento = async (e) => {
    e.preventDefault()
    setErrorModalTratamiento('')
    setGuardandoTratamiento(true)

    try {
      await crearTratamiento({
        descripcion: nuevoTratamiento.descripcion,
        costo: Number(nuevoTratamiento.costo),
        id_servicio: servicioSeleccionado,
      })
      setMostrarModalTratamiento(false)
      await cargarTratamientosDeServicio(servicioSeleccionado)
      setMensajeAlerta('Tratamiento creado con éxito')
      setMostrarAlerta(true)
    } catch (error) {
      setErrorModalTratamiento(error.message)
    } finally {
      setGuardandoTratamiento(false)
    }
  }

  if (loading) return <p>Cargando servicios</p>
  if (error) return <p className="text-red-500">{error}</p>

  const rolNormalizado = rol?.toLowerCase().trim()
  const tieneAcceso = rolNormalizado === 'administrador' || rolNormalizado === 'profesional'

  if (!tieneAcceso) {
    return <p>No tienes permisos para ver esta sección.</p>
  }

  const textoBusqueda = busqueda.toLowerCase()
  const serviciosVisibles = servicios.filter((s) =>
    s.tipo_servicio?.toLowerCase().includes(textoBusqueda)
  )

  let textoBoton = 'Guardar'
  if (guardando) {
    textoBoton = 'Guardando...'
  }

  let textoBotonTratamiento = 'Guardar'
  if (guardandoTratamiento) {
    textoBotonTratamiento = 'Guardando...'
  }

  return (
    <div className="max-w-7xl">
      {mostrarAlerta && (
        <div className="fixed bottom-4 right-4 flex items-center gap-3 bg-green-50 text-green-800 px-4 py-3 rounded-lg shadow-md border border-green-100 min-w-[300px]">
          <span className="flex items-center justify-center w-5 h-5 bg-green-500 text-white rounded-full flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="flex-1 text-sm font-medium">{mensajeAlerta}</span>
          <button onClick={() => setMostrarAlerta(false)} className="text-green-600 hover:text-green-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Servicios Clínicos</h2>
        <button
          onClick={() => setMostrarModal(true)}
          className="bg-[#505FB6] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#3f4d9e] transition-colors"
        >
          + Crear servicio
        </button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
        </svg>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre del servicio"
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#505FB6] focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#04B6B6] text-left text-black-500 uppercase text-xs tracking-wide">
              <th className="p-3 font-semibold w-8"></th>
              <th className="p-3 font-semibold">Nombre de Servicio</th>
              <th className="p-3 font-semibold">Descripción</th>
            </tr>
          </thead>
          <tbody>
            {serviciosVisibles.map((s, index) => {
              const estaExpandido = expandedServicio === s.id_servicio
              const listaTratamientos = tratamientosPorServicio[s.id_servicio]

              let filaClase = 'border-t border-gray-100 hover:bg-[#505FB6]/5 transition-colors cursor-pointer'
              if (index % 2 === 1) {
                filaClase = 'border-t border-gray-100 bg-gray-50/50 hover:bg-[#505FB6]/5 transition-colors cursor-pointer'
              }

              return (
                <>
                  <tr
                    key={s.id_servicio}
                    className={filaClase}
                    onClick={() => toggleExpandido(s.id_servicio)}
                  >
                    <td className="p-3 text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-4 h-4 transition-transform ${estaExpandido ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </td>
                    <td className="p-3 text-gray-600">{s.tipo_servicio}</td>
                    <td className="p-3 text-gray-600">{s.descripcion}</td>
                  </tr>

                  {estaExpandido && (
                    <tr key={`${s.id_servicio}-detalle`} className="bg-gray-50/70 border-t border-gray-100">
                      <td></td>
                      <td colSpan={2} className="p-4">
                        <div className="flex items-center justify-end mb-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              abrirModalTratamiento(s.id_servicio)
                            }}
                            className="text-xs font-medium text-[#505FB6] hover:text-[#3f4d9e]"
                          >
                            + Agregar tratamiento
                          </button>
                        </div>

                        {cargandoTratamientos && listaTratamientos === undefined && (
                          <p className="text-xs text-gray-400">Cargando tratamientos...</p>
                        )}

                        {listaTratamientos && listaTratamientos.length === 0 && (
                          <p className="text-xs text-gray-400">Este servicio aún no tiene tratamientos.</p>
                        )}

                        {listaTratamientos && listaTratamientos.length > 0 && (
                          <table className="w-full text-xs bg-white rounded-lg border border-gray-100 overflow-hidden">
                            <thead>
                              <tr className="text-left text-gray-500 uppercase tracking-wide bg-gray-100">
                                <th className="p-2 font-semibold">Descripción</th>
                                <th className="p-2 font-semibold">Costo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {listaTratamientos.map((t) => (
                                <tr key={t.cod_tratamiento} className="border-t border-gray-100">
                                  <td className="p-2 text-gray-600">{t.descripcion}</td>
                                  <td className="p-2 text-gray-600">${t.costo}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>

        {serviciosVisibles.length === 0 && (
          <p className="p-6 text-center text-gray-400 text-sm">No se encontraron servicios.</p>
        )}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Nuevo servicio</h3>

            {errorModal && <p className="text-red-600 text-sm mb-3">{errorModal}</p>}

            <form onSubmit={handleCrear} className="flex flex-col gap-3">
              <input
                type="text"
                name="tipo_servicio"
                value={nuevoServicio.tipo_servicio}
                onChange={handleChange}
                placeholder="Nombre del servicio"
                required
                className="border rounded-lg p-2"
              />
              <textarea
                name="descripcion"
                value={nuevoServicio.descripcion}
                onChange={handleChange}
                placeholder="Descripción"
                required
                className="border rounded-lg p-2"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setMostrarModal(false)} className="px-4 py-2 rounded-lg border">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-2 rounded-lg bg-[#505FB6] text-white hover:bg-[#3f4d9e] disabled:opacity-50"
                >
                  {textoBoton}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalTratamiento && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Nuevo tratamiento</h3>

            {errorModalTratamiento && <p className="text-red-600 text-sm mb-3">{errorModalTratamiento}</p>}

            <form onSubmit={handleCrearTratamiento} className="flex flex-col gap-3">
              <textarea
                name="descripcion"
                value={nuevoTratamiento.descripcion}
                onChange={handleChangeTratamiento}
                placeholder="Descripción del tratamiento"
                required
                className="border rounded-lg p-2"
              />
              <input
                type="number"
                name="costo"
                value={nuevoTratamiento.costo}
                onChange={handleChangeTratamiento}
                placeholder="Costo"
                min="0"
                required
                className="border rounded-lg p-2"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalTratamiento(false)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoTratamiento}
                  className="px-4 py-2 rounded-lg bg-[#505FB6] text-white hover:bg-[#3f4d9e] disabled:opacity-50"
                >
                  {textoBotonTratamiento}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Servicios