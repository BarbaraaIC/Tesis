import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/usuarios/useAuth.jsx'
import { getReservas, getReservasPorUsuario, getReservasPorProfesional, cancelarReserva, marcarAsistencia } from '../services/reservasServices.jsx'

const nombre_meses_cortos = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
const nombre_dias_cortos = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']

// Colores con buen contraste con texto blanco; se asignan por tratamiento
const colores_tratamiento = ['#0E7C7C', '#505FB6', '#B45309', '#9D174D', '#4D7C0F']

const filtros = [
  { clave: 'todas', texto: 'Todas' },
  { clave: 'proximas', texto: 'Próximas' },
  { clave: 'pasadas', texto: 'Pasadas' },
  { clave: 'sinmarcar', texto: 'Sin marcar' }, // solo para profesional y administrador
]

function pad(numero) {
  return String(numero).padStart(2, '0')
}

function fechaDeHoyTexto() {
  const hoy = new Date()
  return hoy.getFullYear() + '-' + pad(hoy.getMonth() + 1) + '-' + pad(hoy.getDate())
}

// "2026-10-16T00:00:00.000Z" -> "2026-10-16"
function soloFecha(textoFecha) {
  if (!textoFecha) {
    return ''
  }
  return textoFecha.slice(0, 10)
}

// Acepta "16:00", "16:00:00" o "1970-01-01T16:00:00.000Z" -> "16:00"
function extraerHora(textoHora) {
  if (!textoHora) {
    return ''
  }
  const coincidencia = textoHora.match(/(\d{2}):(\d{2})/)
  if (!coincidencia) {
    return ''
  }
  return coincidencia[1] + ':' + coincidencia[2]
}

// "16:00 – 17:00". Usa tiempo_estimado si viene; si no, 1 hora.
function calcularRangoHora(reserva) {
  const inicio = extraerHora(reserva.hora)
  if (!inicio) {
    return '—'
  }

  const partesInicio = inicio.split(':')
  const minutoInicio = Number(partesInicio[0]) * 60 + Number(partesInicio[1])

  let duracion = 60
  const textoDuracion = extraerHora(reserva.tiempo_estimado)
  if (textoDuracion) {
    const partesDuracion = textoDuracion.split(':')
    const minutosDuracion = Number(partesDuracion[0]) * 60 + Number(partesDuracion[1])
    if (minutosDuracion > 0) {
      duracion = minutosDuracion
    }
  }

  const minutoFin = minutoInicio + duracion
  const horaFin = pad(Math.floor(minutoFin / 60) % 24) + ':' + pad(minutoFin % 60)
  return inicio + ' – ' + horaFin
}

function partesDeFecha(textoFecha) {
  const partes = textoFecha.split('-')
  const año = Number(partes[0])
  const mes = Number(partes[1])
  const dia = Number(partes[2])
  // Se crea con año/mes/día locales para evitar desfases por zona horaria
  const fecha = new Date(año, mes - 1, dia)
  return {
    dia: dia,
    mes: nombre_meses_cortos[mes - 1],
    diaSemana: nombre_dias_cortos[fecha.getDay()],
  }
}

function obtenerNombreProfesional(reserva) {
  if (reserva.asignacion && reserva.asignacion.profesional) {
    const profesional = reserva.asignacion.profesional
    return `${profesional.nombre} ${profesional.apellido}`
  }
  if (reserva.profesional) {
    return `${reserva.profesional.nombre} ${reserva.profesional.apellido}`
  }
  return '—'
}

function obtenerNombrePaciente(reserva) {
  if (reserva.asignacion && reserva.asignacion.usuario) {
    const paciente = reserva.asignacion.usuario
    return `${paciente.nombre} ${paciente.apellido}`
  }
  if (reserva.asignacion && reserva.asignacion.paciente) {
    const paciente = reserva.asignacion.paciente
    return `${paciente.nombre} ${paciente.apellido}`
  }
  if (reserva.paciente) {
    return `${reserva.paciente.nombre} ${reserva.paciente.apellido}`
  }
  if (reserva.asignacion && reserva.asignacion.invitado) {
    const invitado = reserva.asignacion.invitado
    return `${invitado.nombre} ${invitado.apellido || ''}`.trim()
  }
  return '—'
}

function obtenerDescripcionTratamiento(reserva) {
  if (reserva.asignacion && reserva.asignacion.tratamiento) {
    return reserva.asignacion.tratamiento.descripcion
  }
  if (reserva.tratamiento) {
    return reserva.tratamiento.descripcion
  }
  return '—'
}

function colorDeTratamiento(descripcion) {
  let suma = 0
  for (let i = 0; i < descripcion.length; i++) {
    suma += descripcion.charCodeAt(i)
  }
  return colores_tratamiento[suma % colores_tratamiento.length]
}

function ordenarPorFechaYHora(reservas) {
  const copia = [...reservas]
  copia.sort((reservaA, reservaB) => {
    const claveA = `${soloFecha(reservaA.dia)} ${extraerHora(reservaA.hora)}`
    const claveB = `${soloFecha(reservaB.dia)} ${extraerHora(reservaB.hora)}`
    if (claveA < claveB) {
      return -1
    }
    if (claveA > claveB) {
      return 1
    }
    return 0
  })
  return copia
}

function agruparPorDia(reservasOrdenadas) {
  const grupos = []
  const grupoPorFecha = {}

  reservasOrdenadas.forEach((reserva) => {
    const fecha = soloFecha(reserva.dia)
    if (!grupoPorFecha[fecha]) {
      grupoPorFecha[fecha] = { fecha: fecha, reservas: [] }
      grupos.push(grupoPorFecha[fecha])
    }
    grupoPorFecha[fecha].reservas.push(reserva)
  })

  return grupos
}

const MisReservas = () => {
  const { usuario, rol } = useAuth()

  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('todas')
  const [cancelandoId, setCancelandoId] = useState(null)
  const [marcandoId, setMarcandoId] = useState(null)
  const [alerta, setAlerta] = useState(null) // { texto, tipo: 'exito' | 'error' }

  let rolActual = ''
  if (rol) {
    rolActual = rol.toLowerCase().trim()
  }
  const esProfesional = rolActual === 'profesional'
  const esAdministrador = rolActual === 'administrador'
  const puedeMarcar = esProfesional || esAdministrador

  useEffect(() => {
    if (!usuario) {
      return
    }
    if (!usuario.id_usuario) {
      return
    }

    const cargarReservas = async () => {
      setCargando(true)
      try {
        let respuesta
        if (esAdministrador) {
          respuesta = await getReservas()
        } else if (esProfesional) {
          respuesta = await getReservasPorProfesional(usuario.id_usuario)
        } else {
          respuesta = await getReservasPorUsuario(usuario.id_usuario)
        }

        setReservas(respuesta.data)
      } catch (errorCapturado) {
        setError(errorCapturado.message)
      } finally {
        setCargando(false)
      }
    }

    cargarReservas()
  }, [usuario, esProfesional, esAdministrador])

  useEffect(() => {
    if (!alerta) {
      return
    }

    const timer = setTimeout(() => setAlerta(null), 3000)
    return () => clearTimeout(timer)
  }, [alerta])

  if (cargando) {
    return <p>Cargando tus horas reservadas...</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  const hoy = fechaDeHoyTexto()
  const reservasOrdenadas = ordenarPorFechaYHora(reservas)

  const reservasFiltradas = reservasOrdenadas.filter((reserva) => {
    const fecha = soloFecha(reserva.dia)
    if (filtro === 'proximas') {
      return fecha >= hoy
    }
    if (filtro === 'pasadas') {
      return fecha < hoy
    }
    if (filtro === 'sinmarcar') {
      const estado = reserva.asistencia || 'pendiente'
      return fecha <= hoy && estado === 'pendiente'
    }
    return true
  })

  const grupos = agruparPorDia(reservasFiltradas)
  if (filtro === 'pasadas') {
    // En "Pasadas" se muestra primero lo más reciente
    grupos.reverse()
  }

  const hayGrupoHoy = grupos.some((grupo) => grupo.fecha === hoy)

  const irAHoy = () => {
    const elemento = document.getElementById('grupo-hoy')
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const cancelarHora = async (reserva) => {
    const descripcion = obtenerDescripcionTratamiento(reserva)
    const fecha = partesDeFecha(soloFecha(reserva.dia))
    const hora = extraerHora(reserva.hora)

    const confirmado = window.confirm(
      `¿Deseas cancelar la hora de ${descripcion} del ${fecha.dia} de ${fecha.mes} a las ${hora}?`,
    )
    if (!confirmado) {
      return
    }

    setCancelandoId(reserva.cod_reserva)
    try {
      await cancelarReserva(reserva.cod_reserva)
      setReservas((reservasAnteriores) => {
        return reservasAnteriores.filter((reservaActual) => {
          return reservaActual.cod_reserva !== reserva.cod_reserva
        })
      })
      setAlerta({ texto: 'Reserva cancelada con éxito', tipo: 'exito' })
    } catch (errorCapturado) {
      setAlerta({ texto: errorCapturado.message, tipo: 'error' })
    } finally {
      setCancelandoId(null)
    }
  }

  const cambiarAsistencia = async (reserva, estadoNuevo) => {
    const estadoActual = reserva.asistencia || 'pendiente'

    // Pulsar de nuevo el botón ya activo lo deja otra vez sin marcar
    let estadoFinal = estadoNuevo
    if (estadoActual === estadoNuevo) {
      estadoFinal = 'pendiente'
    }

    setMarcandoId(reserva.cod_reserva)
    try {
      await marcarAsistencia(reserva.cod_reserva, estadoFinal)
      setReservas((reservasAnteriores) => {
        return reservasAnteriores.map((reservaActual) => {
          if (reservaActual.cod_reserva === reserva.cod_reserva) {
            return { ...reservaActual, asistencia: estadoFinal }
          }
          return reservaActual
        })
      })
    } catch (errorCapturado) {
      setAlerta({ texto: errorCapturado.message, tipo: 'error' })
    } finally {
      setMarcandoId(null)
    }
  }

  const reservasYaOcurridas = reservasOrdenadas.filter((reserva) => soloFecha(reserva.dia) <= hoy)
  const cuentaAsistio = reservasYaOcurridas.filter((reserva) => reserva.asistencia === 'asistio').length
  const cuentaNoAsistio = reservasYaOcurridas.filter((reserva) => reserva.asistencia === 'no_asistio').length
  const cuentaSinMarcar = reservasYaOcurridas.length - cuentaAsistio - cuentaNoAsistio

  const claseBotonBase = 'px-4 py-2 rounded-lg border text-sm font-medium transition-colors min-h-[44px]'
  const claseBotonInactivo = 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
  const claseBotonActivo = 'border-[#04B6B6] bg-[#04B6B6] text-[#042f2f]'

  const tituloColumnaPersona = esProfesional ? 'Paciente' : 'Profesional'

  let tituloPagina = 'Mis horas reservadas'
  let mensajeVacio = 'Aún no tienes horas reservadas.'
  if (esAdministrador) {
    tituloPagina = 'Horas reservadas'
    mensajeVacio = 'Aún no hay horas reservadas.'
  }
  if (reservas.length > 0 && filtro === 'proximas') {
    mensajeVacio = 'No tienes horas próximas.'
  }
  if (reservas.length > 0 && filtro === 'pasadas') {
    mensajeVacio = 'No tienes horas pasadas.'
  }
  if (reservas.length > 0 && filtro === 'sinmarcar') {
    mensajeVacio = 'No tienes horas pendientes de marcar.'
  }

  return (
    <div className="max-w-4xl mx-auto">
      {alerta && (
        <div
          role="status"
          className={
            'fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg shadow-md border min-w-[300px] ' +
            (alerta.tipo === 'exito'
              ? 'bg-green-50 text-green-800 border-green-100'
              : 'bg-red-50 text-red-800 border-red-100')
          }
        >
          <span className="flex-1 text-sm font-medium">{alerta.texto}</span>
          <button type="button" onClick={() => setAlerta(null)} aria-label="Cerrar aviso" className="text-lg leading-none">
            ×
          </button>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-6">{tituloPagina}</h2>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          type="button"
          onClick={irAHoy}
          disabled={!hayGrupoHoy}
          className={claseBotonBase + ' ' + claseBotonInactivo + ' disabled:opacity-50 disabled:cursor-not-allowed'}
        >
          Hoy
        </button>

        {filtros.filter((filtroActual) => filtroActual.clave !== 'sinmarcar' || puedeMarcar).map((filtroActual) => {
          let clase = claseBotonBase + ' ' + claseBotonInactivo
          if (filtro === filtroActual.clave) {
            clase = claseBotonBase + ' ' + claseBotonActivo
          }

          return (
            <button
              type="button"
              key={filtroActual.clave}
              onClick={() => setFiltro(filtroActual.clave)}
              aria-pressed={filtro === filtroActual.clave}
              className={clase}
            >
              {filtroActual.texto}
            </button>
          )
        })}
      </div>

      {puedeMarcar && reservasYaOcurridas.length > 0 && (
        <p className="mb-4 text-sm text-gray-700">
          <span className="font-semibold text-green-700">{cuentaAsistio} asistieron</span>
          {' · '}
          <span className="font-semibold text-red-600">{cuentaNoAsistio} no asistieron</span>
          {' · '}
          <span className="font-semibold text-gray-600">{cuentaSinMarcar} sin marcar</span>
        </p>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {grupos.map((grupo, indice) => {
          const fecha = partesDeFecha(grupo.fecha)
          const esHoy = grupo.fecha === hoy
          const esPasado = grupo.fecha < hoy

          let claseGrupo = 'grid grid-cols-[84px_1fr] sm:grid-cols-[132px_1fr] px-4 sm:px-6 py-4'
          if (indice > 0) {
            claseGrupo = claseGrupo + ' border-t border-gray-200'
          }
          if (esHoy) {
            claseGrupo = claseGrupo + ' bg-[#505FB6]/5'
          }

          let claseNumero = 'text-3xl font-medium leading-none text-gray-900'
          let claseEtiqueta = 'text-xs text-gray-600 mt-1'
          let textoEtiqueta = fecha.mes + ' · ' + fecha.diaSemana
          if (esHoy) {
            claseNumero = 'text-3xl font-medium leading-none text-[#505FB6]'
            claseEtiqueta = 'text-xs text-[#505FB6] font-semibold mt-1'
            textoEtiqueta = 'HOY · ' + fecha.diaSemana
          }

          let claseTextoEvento = 'text-gray-800'
          if (esPasado) {
            claseTextoEvento = 'text-gray-500'
          }

          return (
            <div key={grupo.fecha} id={esHoy ? 'grupo-hoy' : undefined} className={claseGrupo}>
              <div>
                <div className={claseNumero}>{fecha.dia}</div>
                <div className={claseEtiqueta}>{textoEtiqueta}</div>
              </div>

              <div className="flex flex-col gap-1">
                {grupo.reservas.map((reserva) => {
                  const descripcion = obtenerDescripcionTratamiento(reserva)
                  const estadoAsistencia = reserva.asistencia || 'PENDIENTE'
                  const esFutura = grupo.fecha > hoy
                  const claseAsistio =
                    estadoAsistencia === 'asistio'
                      ? 'border-green-700 bg-green-700 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  const claseNoAsistio =
                    estadoAsistencia === 'no_asistio'
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'

                  let nombrePersona
                  if (esAdministrador || esProfesional) {
                    nombrePersona = obtenerNombrePaciente(reserva)
                  } else {
                    nombrePersona = obtenerNombreProfesional(reserva)
                  }

                  return (
                    <div
                      key={reserva.cod_reserva}
                      className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-3 py-2 rounded-lg text-sm hover:bg-gray-100"
                    >
                      <span className="flex items-center gap-3 sm:w-[140px] shrink-0 text-gray-700">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: colorDeTratamiento(descripcion) }}
                        />
                        {calcularRangoHora(reserva)}
                      </span>
                      <span className={'flex-1 font-semibold ' + claseTextoEvento}>{descripcion}</span>
                      <span className="sm:w-[240px] text-gray-600" title={tituloColumnaPersona}>
                        {nombrePersona}
                        {esAdministrador && (
                          <span className="block text-xs text-gray-500">
                            Prof. {obtenerNombreProfesional(reserva)}
                          </span>
                        )}
                      </span>
                      {puedeMarcar && !esFutura && (
                        <span className="flex gap-1 self-start sm:self-auto" role="group" aria-label="Asistencia">
                          <button
                            type="button"
                            onClick={() => cambiarAsistencia(reserva, 'asistio')}
                            disabled={marcandoId === reserva.cod_reserva}
                            aria-pressed={estadoAsistencia === 'ASISTIO'}
                            className={'px-3 py-1 rounded border text-xs font-medium disabled:opacity-50 ' + claseAsistio}
                          >
                            Asistió
                          </button>
                          <button
                            type="button"
                            onClick={() => cambiarAsistencia(reserva, 'no_asistio')}
                            disabled={marcandoId === reserva.cod_reserva}
                            aria-pressed={estadoAsistencia === 'NO_ASISTIO'}
                            className={'px-3 py-1 rounded border text-xs font-medium disabled:opacity-50 ' + claseNoAsistio}
                          >
                            No asistió
                          </button>
                        </span>
                      )}
                      {!puedeMarcar && estadoAsistencia === 'asistio' && (
                        <span className="text-xs font-semibold text-green-700">Asististe</span>
                      )}
                      {!puedeMarcar && estadoAsistencia === 'no_asistio' && (
                        <span className="text-xs font-semibold text-red-600">No asististe</span>
                      )}
                      {!esPasado && (
                        <button
                          type="button"
                          onClick={() => cancelarHora(reserva)}
                          disabled={cancelandoId === reserva.cod_reserva}
                          className="self-start sm:self-auto px-3 py-1 rounded text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                        >
                          {cancelandoId === reserva.cod_reserva ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {grupos.length === 0 && (
          <p className="p-6 text-center text-gray-400 text-sm">{mensajeVacio}</p>
        )}
      </div>
    </div>
  )
}

export default MisReservas