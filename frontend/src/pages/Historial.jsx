import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/usuarios/useAuth.jsx'
import { cargarHistorialMedico, registrarSesion } from '../services/historialServices.jsx'
import { getUsuarios } from '../services/usuariosServices.jsx'

// "2026-10-17" -> "17 oct"
const diaCorto = (dia) =>
  new Date(`${dia}T00:00:00`)
    .toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
    .replace('.', '')


const diaConAnio = (dia) => `${diaCorto(dia)} ${dia.slice(0, 4)}`

const diaLargo = (dia) => {
  const texto = new Date(`${dia}T00:00:00`)
    .toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(',', '')
    .replace(/\./g, '')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

const estados = {
  asistio: { texto: 'Asistió', clase: 'bg-[#E6F7F7] text-[#036f6f]' },
  no_asistio: { texto: 'No asistió', clase: 'bg-red-50 text-red-800' },
}

const Tarjeta = ({ titulo, children }) => (
  <section className="bg-white border border-gray-200 rounded-xl p-5">
    <h2 className="text-base font-semibold mb-3">{titulo}</h2>
    {children}
  </section>
)

function RegistrarSesionModal({ pendientes, onCerrar, onGuardado }) {
  const [codReserva, setCodReserva] = useState(pendientes[0]?.cod_reserva ?? '')
  const [asistencia, setAsistencia] = useState('asistio')
  const [nota, setNota] = useState(pendientes[0]?.observaciones ?? '')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const alTeclear = (evento) => {
      if (evento.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [onCerrar])

  const asistio = asistencia === 'asistio'

  const guardar = async (evento) => {
    evento.preventDefault()
    setError('')

    if (asistio && nota.trim().length < 5) {
      setError('Describe brevemente lo que se hizo en la sesión.')
      return
    }

    setEnviando(true)
    try {
      await registrarSesion(codReserva, { asistencia, observaciones: nota })
      onGuardado()
    } catch (errorCapturado) {
      setError(errorCapturado.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onCerrar}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-registro"
        onClick={(evento) => evento.stopPropagation()}
        onSubmit={guardar}
        className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col gap-4"
      >
        <h2 id="titulo-registro" className="text-lg font-semibold">Registrar sesión</h2>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        {pendientes.length === 0 ? (
          <p className="text-sm text-gray-600">
            No hay horas pendientes por registrar. Aparecen aquí cuando llega el día de la hora agendada.
          </p>
        ) : (
          <>
            <div>
              <label htmlFor="hora-sesion" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Hora a registrar
              </label>
              <select
                id="hora-sesion"
                value={codReserva}
                onChange={(evento) => {
                  setCodReserva(evento.target.value)
                  const elegida = pendientes.find((hora) => String(hora.cod_reserva) === evento.target.value)
                  setNota(elegida?.observaciones ?? '')
                }}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white"
              >
                {pendientes.map((hora) => (
                  <option key={hora.cod_reserva} value={hora.cod_reserva}>
                    {diaConAnio(hora.dia)} · {hora.hora} · {hora.tratamiento}
                  </option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className="block text-xs font-semibold text-gray-500 uppercase mb-1">¿El paciente asistió?</legend>
              <div className="flex gap-6 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="asistencia" checked={asistio} onChange={() => setAsistencia('asistio')} />
                  Asistió
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="asistencia" checked={!asistio} onChange={() => setAsistencia('no_asistio')} />
                  No asistió
                </label>
              </div>
            </fieldset>

            <div>
              <label htmlFor="nota-sesion" className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                {asistio ? 'Descripción de lo que se hizo' : 'Observación (opcional)'}
              </label>
              <textarea
                id="nota-sesion"
                value={nota}
                onChange={(evento) => setNota(evento.target.value)}
                maxLength={500}
                rows={asistio ? 5 : 3}
                placeholder={asistio ? 'Ej: masaje descontracturante en cuello y hombros, buena respuesta.' : ''}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{asistio ? 'Incluye la zona trabajada y cómo respondió el paciente.' : ''}</span>
                <span>{nota.length}/500</span>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 mt-2">
          <button type="button" onClick={onCerrar} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium cursor-pointer">
            Cancelar
          </button>
          {pendientes.length > 0 && (
            <button
              type="submit"
              disabled={enviando}
              className="px-4 py-2 rounded-lg bg-[#505FB6] text-white text-sm font-medium hover:bg-[#3f4d9e] disabled:opacity-50 cursor-pointer"
            >
              {enviando ? 'Guardando...' : 'Guardar sesión'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
function HistorialPaciente({ idUsuario }) {
  const { usuario } = useAuth()

  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [version, setVersion] = useState(0)   // sube para volver a cargar el historial

  const idPaciente = idUsuario || usuario?.id_usuario

  useEffect(() => {
    if (!idPaciente) return

    const cargarHistorial = async () => {
      try {
        const respuesta = await cargarHistorialMedico(idPaciente)
        setDatos(respuesta.data)
      } catch (errorCapturado) {
        setError(errorCapturado.message)
      }
    }

    cargarHistorial()
  }, [idPaciente, version])

  if (error) {
    return <p className="text-red-600 text-sm">{error}</p>
  }

  if (!datos) {
    return <p className="text-sm text-gray-500">Cargando historial</p>
  }

  const { paciente, resumen, sesiones, pendientesPorRegistrar, puedeRegistrar } = datos

  const iniciales = `${paciente.nombre?.[0] ?? ''}${paciente.apellido?.[0] ?? ''}`.toUpperCase()

  const alGuardarSesion = () => {
    setModalAbierto(false)
    setVersion((actual) => actual + 1)
  }

  let porcentajePlan = 0
  if (resumen.sesionesPlan) {
    porcentajePlan = Math.min(100, (resumen.sesionesRealizadas / resumen.sesionesPlan) * 100)
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <header className="bg-white border border-gray-200 rounded-xl p-5 flex flex-wrap items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-[#04B6B6] text-[#042f2f] flex items-center justify-center text-xl font-semibold">
          {iniciales}
        </div>
        <div>
          <h1 className="text-xl font-semibold">{paciente.nombre} {paciente.apellido}</h1>
          <p className="text-sm text-gray-500">
            Historial de tratamientos{resumen.plan ? ` · ${resumen.plan}` : ''}
          </p>
        </div>

        {puedeRegistrar && (
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="ml-auto bg-[#505FB6] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#3f4d9e] cursor-pointer"
          >
            Registrar sesión
            {pendientesPorRegistrar.length > 0 && ` (${pendientesPorRegistrar.length})`}
          </button>
        )}
      </header>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="flex-1 basis-72 flex flex-col gap-6">
          <Tarjeta titulo="Resumen">
            {resumen.proximaHora ? (
              <div className="bg-[#505FB6] text-white rounded-lg px-4 py-3 mb-4">
                <p className="text-xs">Próxima hora</p>
                <p className="text-base font-semibold">
                  {diaLargo(resumen.proximaHora.dia)} · {resumen.proximaHora.hora}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">No hay una próxima hora agendada.</p>
            )}

            {resumen.sesionesPlan ? (
              <>
                <p className="text-sm mb-1">
                  Plan {resumen.plan}: <strong>{resumen.sesionesRealizadas} de {resumen.sesionesPlan} sesiones</strong>
                </p>
                <div
                  role="progressbar"
                  aria-label="Sesiones realizadas"
                  aria-valuemin={0}
                  aria-valuemax={resumen.sesionesPlan}
                  aria-valuenow={resumen.sesionesRealizadas}
                  className="h-2 bg-gray-200 rounded-full"
                >
                  <div className="h-2 bg-[#505FB6] rounded-full" style={{ width: `${porcentajePlan}%` }} />
                </div>
              </>
            ) : (
              <p className="text-sm">
                Sesiones realizadas: <strong>{resumen.sesionesRealizadas}</strong>
              </p>
            )}
          </Tarjeta>

          <Tarjeta titulo="Antecedentes">
            <p className="text-xs text-gray-500">Enfermedades</p>
            <p className="text-sm mb-3">{paciente.enfermedades || 'Ninguna declarada'}</p>
            <p className="text-xs text-gray-500">Medicamentos</p>
            <p className="text-sm">{paciente.medicamentos || 'Ninguno'}</p>
          </Tarjeta>
        </div>

        <div className="flex-[2_1_30rem]">
          <Tarjeta titulo="Historial de tratamientos">
            {sesiones.length === 0 ? (
              <p className="text-sm text-gray-500">Aún no hay sesiones registradas.</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {sesiones.map((sesion) => {
                  const estado = estados[sesion.asistencia]
                  const asistio = sesion.asistencia === 'asistio'
                  return (
                    <li key={sesion.cod_reserva} className="flex gap-4">
                      <div className="w-24 shrink-0">
                        <p className="text-[15px] font-semibold">{diaConAnio(sesion.dia)}</p>
                        <p className="text-xs text-gray-500">{sesion.hora} hrs</p>
                      </div>

                      <div className="flex-1 border border-gray-200 rounded-lg px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[15px] font-semibold">{sesion.tratamiento}</p>
                          {estado && (
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${estado.clase}`}>
                              {estado.texto}
                            </span>
                          )}
                        </div>

                        <p className="text-[13px] text-gray-500 mt-1">
                          {sesion.profesional} · {sesion.duracion_min} min
                        </p>

                        {sesion.nota ? (
                          <>
                            <p className="text-xs text-gray-500 mt-3">
                              {asistio ? 'Descripción de la sesión' : 'Observación'}
                            </p>
                            <p className="text-sm text-gray-700">{sesion.nota}</p>
                          </>
                        ) : (
                          asistio && (
                            <p className="text-sm text-gray-400 mt-3">Sin descripción registrada.</p>
                          )
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Tarjeta>
        </div>
      </div>

      {modalAbierto && (
        <RegistrarSesionModal
          pendientes={pendientesPorRegistrar}
          onCerrar={() => setModalAbierto(false)}
          onGuardado={alGuardarSesion}
        />
      )}
    </div>
  )
}

function SelectorPaciente() {
  const navigate = useNavigate()
  const [pacientes, setPacientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        const respuesta = await getUsuarios(localStorage.getItem('token'))
        const soloPacientes = respuesta.data.filter(
          (persona) => (persona.rol || '').toLowerCase() === 'paciente'
        )
        setPacientes(soloPacientes)
      } catch (errorCapturado) {
        setError(errorCapturado.message)
      } finally {
        setCargando(false)
      }
    }

    cargarPacientes()
  }, [])

  const texto = busqueda.trim().toLowerCase()
  const visibles = pacientes.filter((paciente) =>
    `${paciente.nombre} ${paciente.apellido} ${paciente.rut}`.toLowerCase().includes(texto)
  )

  return (
    <div className="max-w-2xl mx-auto">
      <Tarjeta titulo="Historial médico">
        <label htmlFor="buscar-paciente" className="sr-only">Buscar paciente</label>
        <input
          id="buscar-paciente"
          type="search"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Buscar paciente por nombre o RUT"
          className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-3"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {cargando && <p className="text-sm text-gray-500">Cargando pacientes</p>}
        {!cargando && !error && visibles.length === 0 && (
          <p className="text-sm text-gray-500">No se encontraron pacientes.</p>
        )}

        <ul className="flex flex-col">
          {visibles.map((paciente) => (
            <li key={paciente.id_usuario}>
              <button
                type="button"
                onClick={() => navigate(`/historialMedico/${paciente.id_usuario}`)}
                className="w-full min-h-11 flex justify-between gap-3 px-3 py-2.5 rounded-lg text-sm text-left hover:bg-gray-50 cursor-pointer"
              >
                <span>{paciente.nombre} {paciente.apellido}</span>
                <span className="text-gray-500">{paciente.rut}</span>
              </button>
            </li>
          ))}
        </ul>
      </Tarjeta>
    </div>
  )
}

function Historial() {
  const { id_usuario } = useParams()
  const { rol } = useAuth()

  const esPaciente = (rol || '').toLowerCase().trim() === 'paciente'

  if (!id_usuario && !esPaciente) {
    return <SelectorPaciente />
  }

  return <HistorialPaciente idUsuario={id_usuario} />
}

export default Historial