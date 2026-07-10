import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/usuarios/useAuth.jsx'
import { getUsuarios } from '../services/usuariosServices.jsx'
import { getServicios } from '../services/serviciosServices.jsx'
import { getTratamientosPorServicio } from '../services/tratamientosServices.jsx'
import { asignarTratamiento, getProfesionalesPorPaciente } from '../services/tratamientosAsigServices.jsx'
import { crearReserva } from '../services/reservasServices.jsx'

const DURACION_BLOQUE_MIN = 60

const HORARIO_ATENCION = {
  0: { apertura: '08:00', cierre: '20:00' },
  1: { apertura: '08:00', cierre: '20:00' },
  2: { apertura: '08:00', cierre: '20:00' },
  3: { apertura: '08:00', cierre: '20:00' },
  4: { apertura: '08:00', cierre: '20:00' },
  5: { apertura: '08:00', cierre: '20:00' },
  6: { apertura: '08:00', cierre: '18:00' },
}

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const NOMBRES_DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']


function horaAMinutos(hora) {
  const partes = hora.split(':')
  const horas = Number(partes[0])
  const minutos = Number(partes[1])
  return horas * 60 + minutos
}

function minutosAHora(totalMinutos) {
  const horas = String(Math.floor(totalMinutos / 60)).padStart(2, '0')
  const minutos = String(totalMinutos % 60).padStart(2, '0')
  return horas + ':' + minutos
}

function generarHorariosDelDia(fecha) {
  const diaDeLaSemana = fecha.getDay()
  const horario = HORARIO_ATENCION[diaDeLaSemana]

  const minutoInicio = horaAMinutos(horario.apertura)
  const minutoFin = horaAMinutos(horario.cierre)

  const horarios = []
  for (let minuto = minutoInicio; minuto + DURACION_BLOQUE_MIN <= minutoFin; minuto += DURACION_BLOQUE_MIN) {
    horarios.push(minutosAHora(minuto))
  }
  return horarios
}

function fechaAtexto(fecha) {
  const año = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return año + '-' + mes + '-' + dia
}

function esElMismoDia(fechaA, fechaB) {
  if (!fechaA || !fechaB) return false
  return fechaAtexto(fechaA) === fechaAtexto(fechaB)
}

function yaPaso(fecha) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return fecha < hoy
}

function generarGrillaDelMes(fecha) {
  const primerDiaDelMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
  const ultimoDiaDelMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0)

  const celdas = []

  for (let i = 0; i < primerDiaDelMes.getDay(); i++) {
    celdas.push(null)
  }

  for (let dia = 1; dia <= ultimoDiaDelMes.getDate(); dia++) {
    celdas.push(new Date(fecha.getFullYear(), fecha.getMonth(), dia))
  }

  return celdas
}

const Reservas = () => {
  const { usuario, rol } = useAuth()
  const rolActual = rol?.toLowerCase().trim()
  const esPaciente = rolActual === 'paciente'
  const esProfesional = rolActual === 'profesional'

  const [pacientes, setPacientes] = useState([])
  const [profesionales, setProfesionales] = useState([])
  const [servicios, setServicios] = useState([])
  const [tratamientos, setTratamientos] = useState([])

  const [cargandoPagina, setCargandoPagina] = useState(true)
  const [cargandoTratamientos, setCargandoTratamientos] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    id_usuario: '',
    id_profesional: '',
    id_servicio: '',
    cod_tratamiento: '',
    observaciones: '',
  })

  const [mesVisible, setMesVisible] = useState(() => {
    const hoy = new Date()
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  })
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [horaSeleccionada, setHoraSeleccionada] = useState(null)

  const [enviando, setEnviando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState('')
  const [mostrarExito, setMostrarExito] = useState(false)


  useEffect(() => {
    if (!usuario?.id_usuario) {
      return
    }

    const cargarProfesionalesDelPaciente = async () => {
      const respuesta = await getProfesionalesPorPaciente(usuario.id_usuario)
      setProfesionales(respuesta.data)
      setForm((prev) => ({ ...prev, id_usuario: usuario.id_usuario }))
    }

    const cargarPacientesYProfesionales = async () => {
      const respuesta = await getUsuarios()
      const listaCompleta = respuesta.data

      const soloPacientes = listaCompleta.filter((u) => u.rol?.toLowerCase() === 'paciente')
      setPacientes(soloPacientes)

      if (esProfesional) {
        setForm((prev) => ({ ...prev, id_profesional: usuario.id_usuario }))
      } else {
        const soloProfesionales = listaCompleta.filter((u) => u.rol?.toLowerCase() === 'profesional')
        setProfesionales(soloProfesionales)
      }
    }

    const cargarDatosDeLaPagina = async () => {
      setCargandoPagina(true)
      try {
        const respuestaServicios = await getServicios()
        setServicios(respuestaServicios.data)

        if (esPaciente) {
          await cargarProfesionalesDelPaciente()
        } else {
          await cargarPacientesYProfesionales()
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setCargandoPagina(false)
      }
    }

    cargarDatosDeLaPagina()
  }, [esPaciente, esProfesional, usuario?.id_usuario])

  useEffect(() => {
    if (!mostrarExito) return

    const timer = setTimeout(() => {
      setMostrarExito(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [mostrarExito])

  const actualizarCampo = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const cambiarServicio = async (e) => {
    const idServicioElegido = e.target.value

    setForm((prev) => ({ ...prev, id_servicio: idServicioElegido, cod_tratamiento: '' }))
    setTratamientos([])

    if (!idServicioElegido) return

    setCargandoTratamientos(true)
    try {
      const respuesta = await getTratamientosPorServicio(idServicioElegido)
      const lista = Array.isArray(respuesta.data) ? respuesta.data : [respuesta.data]
      setTratamientos(lista)
    } catch (err) {
      console.error('no se pudieron cargar los tratamientos', err)
      setTratamientos([])
    } finally {
      setCargandoTratamientos(false)
    }
  }

  const diasDelMes = generarGrillaDelMes(mesVisible)
  const horariosDisponibles = diaSeleccionado ? generarHorariosDelDia(diaSeleccionado) : []

  const irAlMesAnterior = () => {
    setMesVisible((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const irAlMesSiguiente = () => {
    setMesVisible((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const elegirDia = (fecha) => {
    if (!fecha || yaPaso(fecha)) return
    setDiaSeleccionado(fecha)
    setHoraSeleccionada(null)
  }

  const limpiarFormulario = () => {
    setForm({
      id_usuario: esPaciente ? usuario?.id_usuario ?? '' : '',
      id_profesional: esProfesional ? usuario?.id_usuario ?? '' : '',
      id_servicio: '',
      cod_tratamiento: '',
      observaciones: '',
    })
    setTratamientos([])
    setDiaSeleccionado(null)
    setHoraSeleccionada(null)
  }

  const reservar = async (e) => {
    e.preventDefault()
    setErrorFormulario('')

    if (!diaSeleccionado || !horaSeleccionada) {
      setErrorFormulario('Selecciona un día y un horario en el calendario.')
      return
    }

    setEnviando(true)

    try {
      const asignacion = await asignarTratamiento({
        id_usuario: Number(form.id_usuario),
        id_profesional: Number(form.id_profesional),
        cod_tratamiento: Number(form.cod_tratamiento),
        observaciones: esPaciente ? '' : form.observaciones,
      })

      const idAsignacion = asignacion.data?.id_asignacion
      if (!idAsignacion) {
        throw new Error('No se pudo obtener el id de la asignación creada')
      }

      await crearReserva({
        dia: fechaAtexto(diaSeleccionado),
        hora: horaSeleccionada,
        tiempo_estimado: '01:00',
        id_asignacion: idAsignacion,
      })

      limpiarFormulario()
      setMostrarExito(true)
    } catch (err) {
      setErrorFormulario(err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (cargandoPagina) {
    return <p>Cargando datos</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  if (esPaciente && profesionales.length === 0) {
    return (
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Nueva reserva</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500">
            Aún no tienes profesionales asignados, contacta al centro.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {mostrarExito && (
        <div className="fixed bottom-4 right-4 flex items-center gap-3 bg-green-50 text-green-800 px-4 py-3 rounded-lg shadow-md border border-green-100 min-w-[300px]">
          <span className="flex items-center justify-center w-5 h-5 bg-green-500 text-white rounded-full flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span className="flex-1 text-sm font-medium">Reserva creada con éxito</span>
          <button onClick={() => setMostrarExito(false)} className="text-green-600 hover:text-green-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nueva reserva</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {errorFormulario && <p className="text-red-600 text-sm mb-4">{errorFormulario}</p>}

        <form onSubmit={reservar} className="flex flex-col gap-5">
          <div className={esPaciente || esProfesional ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-2 gap-4'}>
            {!esPaciente && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Paciente</label>
                <select name="id_usuario" value={form.id_usuario} onChange={actualizarCampo} required className="w-full border rounded-lg p-2 text-sm">
                  <option value="">Selecciona un paciente</option>
                  {pacientes.map((p) => (
                    <option key={p.id_usuario} value={p.id_usuario}>{p.nombre} {p.apellido}</option>
                  ))}
                </select>
              </div>
            )}

            {!esProfesional && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Profesional</label>
                <select name="id_profesional" value={form.id_profesional} onChange={actualizarCampo} required className="w-full border rounded-lg p-2 text-sm">
                  <option value="">Selecciona un profesional</option>
                  {profesionales.map((p) => (
                    <option key={p.id_usuario} value={p.id_usuario}>{p.nombre} {p.apellido}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Servicio</label>
              <select name="id_servicio" value={form.id_servicio} onChange={cambiarServicio} required className="w-full border rounded-lg p-2 text-sm">
                <option value="">Selecciona un servicio</option>
                {servicios.map((s) => (
                  <option key={s.id_servicio} value={s.id_servicio}>{s.tipo_servicio}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tratamiento</label>
              <select
                name="cod_tratamiento"
                value={form.cod_tratamiento}
                onChange={actualizarCampo}
                required
                disabled={!form.id_servicio || cargandoTratamientos}
                className="w-full border rounded-lg p-2 text-sm disabled:bg-gray-100"
              >
                <option value="">{cargandoTratamientos ? 'Cargando...' : 'Selecciona un tratamiento'}</option>
                {tratamientos.map((t) => (
                  <option key={t.cod_tratamiento} value={t.cod_tratamiento}>{t.descripcion} (${t.costo})</option>
                ))}
              </select>
            </div>
          </div>

          {!esPaciente && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Observaciones</label>
              <textarea name="observaciones" value={form.observaciones} onChange={actualizarCampo} placeholder="Opcional" className="w-full border rounded-lg p-2 text-sm" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Fecha y hora</label>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={irAlMesAnterior} className="text-gray-400 hover:text-gray-700 px-2">‹</button>
                <span className="text-sm font-semibold text-gray-700">
                  {NOMBRES_MESES[mesVisible.getMonth()]} {mesVisible.getFullYear()}
                </span>
                <button type="button" onClick={irAlMesSiguiente} className="text-gray-400 hover:text-gray-700 px-2">›</button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
                {NOMBRES_DIAS.map((dia) => <div key={dia}>{dia}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {diasDelMes.map((fecha, index) => {
                  if (!fecha) return <div key={'vacio-' + index} />

                  const pasado = yaPaso(fecha)
                  const seleccionado = esElMismoDia(fecha, diaSeleccionado)

                  let clase = 'text-sm p-2 rounded-lg text-gray-600 hover:bg-[#505FB6]/10'
                  if (pasado) clase = 'text-sm p-2 rounded-lg text-gray-300 cursor-not-allowed'
                  if (seleccionado) clase = 'text-sm p-2 rounded-lg bg-[#505FB6] text-white'

                  return (
                    <button type="button" key={fechaAtexto(fecha)} onClick={() => elegirDia(fecha)} disabled={pasado} className={clase}>
                      {fecha.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>

            {diaSeleccionado && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Horarios disponibles — {fechaAtexto(diaSeleccionado)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {horariosDisponibles.map((hora) => {
                    let clase = 'text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-[#505FB6]'
                    if (horaSeleccionada === hora) {
                      clase = 'text-xs px-3 py-2 rounded-lg border border-[#505FB6] bg-[#505FB6] text-white'
                    }
                    return (
                      <button type="button" key={hora} onClick={() => setHoraSeleccionada(hora)} className={clase}>
                        {hora}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-2">
            <button type="submit" disabled={enviando} className="px-4 py-2 rounded-lg bg-[#505FB6] text-white text-sm font-medium hover:bg-[#3f4d9e] disabled:opacity-50">
              {enviando ? 'Reservando...' : 'Reservar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Reservas