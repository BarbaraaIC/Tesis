import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/usuarios/useAuth.jsx'
import { getUsuarios } from '../services/usuariosServices.jsx'
import { getServicios } from '../services/serviciosServices.jsx'
import { getTratamientosPorServicio } from '../services/tratamientosServices.jsx'
import { asignarTratamiento} from '../services/tratamientosAsigServices.jsx'
import { crearReserva, getReservasPorProfesional } from '../services/reservasServices.jsx'

const duracion_bloque_en_min = 60

const horario_atencion = {
  0: { apertura: '08:00', cierre: '21:00' },
  1: { apertura: '08:00', cierre: '21:00' },
  2: { apertura: '08:00', cierre: '21:00' },
  3: { apertura: '08:00', cierre: '21:00' },
  4: { apertura: '08:00', cierre: '21:00' },
  5: { apertura: '08:00', cierre: '21:00' },
  6: { apertura: '08:00', cierre: '19:00' },
}

const nombre_meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const nombre_dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']


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
  const horario = horario_atencion[diaDeLaSemana]

  const minutoInicio = horaAMinutos(horario.apertura)
  const minutoFin = horaAMinutos(horario.cierre)

  const horarios = []
  for (let minuto = minutoInicio; minuto + duracion_bloque_en_min <= minutoFin; minuto += duracion_bloque_en_min) {
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
  if (!fechaA) {
    return false
  }
  if (!fechaB) {
    return false
  }
  return fechaAtexto(fechaA) === fechaAtexto(fechaB)
}

function yaPaso(fecha) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return fecha < hoy
}

function generarDiasDelMes(fecha) {
  const primerDiaDelMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
  const ultimoDiaDelMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0)

  const celdas = []

  for (let contador = 0; contador < primerDiaDelMes.getDay(); contador++) {
    celdas.push(null)
  }

  for (let dia = 1; dia <= ultimoDiaDelMes.getDate(); dia++) {
    celdas.push(new Date(fecha.getFullYear(), fecha.getMonth(), dia))
  }

  return celdas
}

function obtenerRolNormalizado(usuarioActual) {
  if (!usuarioActual.rol) {
    return ''
  }
  return usuarioActual.rol.toLowerCase()
}

function horaDeReserva(reserva) {
  const valorHora = reserva.hora

  if (!valorHora) {
    return ''
  }

  const coincidenciaISO = valorHora.match(/T(\d{2}):(\d{2})/)
  if (coincidenciaISO) {
    return coincidenciaISO[1] + ':' + coincidenciaISO[2]
  }



  const coincidenciaSimple = valorHora.match(/^(\d{2}):(\d{2})/)
  if (coincidenciaSimple) {
    return coincidenciaSimple[1] + ':' + coincidenciaSimple[2]
  }

  console.log("No se logro interpretar el formato de la hora", valorHora)
  return ''
}

function fechaTextoDesdeISO(fechaISO) {
  return fechaISO.slice(0, 10)
}

const Reservas = () => {
  const { usuario, rol } = useAuth()

  let rolActual = ''
  if (rol) {
    rolActual = rol.toLowerCase().trim()
  }

  const esPaciente = rolActual === 'paciente'
  const esProfesional = rolActual === 'profesional'

  const [pacientes, setPacientes] = useState([])
  const [profesionales, setProfesionales] = useState([])
  const [servicios, setServicios] = useState([])
  const [tratamientos, setTratamientos] = useState([])

  const [cargandoPagina, setCargandoPagina] = useState(true)
  const [cargandoTratamientos, setCargandoTratamientos] = useState(false)
  const [error, setError] = useState(null)

  const [formulario, setFormulario] = useState({
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
  const [horasOcupadas, setHorasOcupadas] = useState([])

  const [enviando, setEnviando] = useState(false)
  const [errorFormulario, setErrorFormulario] = useState('')
  const [mostrarExito, setMostrarExito] = useState(false)


  useEffect(() => {
    if (!usuario) {
      return
    }
    if (!usuario.id_usuario) {
      return
    }

    const cargarPacientesYProfesionales = async () => {
      const respuesta = await getUsuarios()
      const listaCompletaDeUsuarios = respuesta.data

      if (esPaciente) {
        setFormulario((formularioAnterior) => {
          return { ...formularioAnterior, id_usuario: usuario.id_usuario }
        })
      } else {
        const soloPacientes = listaCompletaDeUsuarios.filter((usuarioActual) => {
          return obtenerRolNormalizado(usuarioActual) === 'paciente'
        })
        setPacientes(soloPacientes)
      }

      if (esProfesional) {
        setFormulario((formularioAnterior) => {
          return { ...formularioAnterior, id_profesional: usuario.id_usuario }
        })
      } else {
        const soloProfesionales = listaCompletaDeUsuarios.filter((usuarioActual) => {
          return obtenerRolNormalizado(usuarioActual) === 'profesional'
        })
        setProfesionales(soloProfesionales)
      }
    }

     const cargarDatosDeLaPagina = async () => {
      setCargandoPagina(true)
      try {
        const respuestaServicios = await getServicios()
        setServicios(respuestaServicios.data)

        await cargarPacientesYProfesionales()
      } catch (error) {
        setError(error.message)
      } finally {
        setCargandoPagina(false)
      }
    }

    cargarDatosDeLaPagina()
  }, [esPaciente, esProfesional, usuario])

  useEffect(() => {
    if (!mostrarExito) {
      return
    }

    const timer = setTimeout(() => {
      setMostrarExito(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [mostrarExito])

  useEffect(() => {
    const cargarHorasOcupadas = async () => {
      if (!diaSeleccionado || !formulario.id_profesional) {
        setHorasOcupadas([])
        return
      }

      try {
        const respuesta = await getReservasPorProfesional(formulario.id_profesional)
        const todasLasReservas = respuesta.data

        const reservasDelDiaSeleccionado = todasLasReservas.filter((reserva) => {
          return fechaTextoDesdeISO(reserva.dia) === fechaAtexto(diaSeleccionado)
        })

        const horas = reservasDelDiaSeleccionado.map((reserva) => {
          return horaDeReserva(reserva)
        })

        setHorasOcupadas(horas)
      } catch (error) {
        console.error("No se lograron mostrar las horas ocupadas", error)
        setHorasOcupadas([])
      }
    }

    cargarHorasOcupadas()
  }, [diaSeleccionado, formulario.id_profesional])

  let horaSeleccionadaValida = null
  if (horaSeleccionada && !horasOcupadas.includes(horaSeleccionada)) {
    horaSeleccionadaValida = horaSeleccionada
  }

  const actualizarCampo = (evento) => {
    const nombreCampo = evento.target.name
    const valorCampo = evento.target.value
    setFormulario((formularioAnterior) => {
      return { ...formularioAnterior, [nombreCampo]: valorCampo }
    })
  }

  const cambiarServicio = async (evento) => {
    const idServicioElegido = evento.target.value

    setFormulario((formularioAnterior) => {
      return { ...formularioAnterior, id_servicio: idServicioElegido, cod_tratamiento: '' }
    })
    setTratamientos([])

    if (!idServicioElegido) {
      return
    }

    setCargandoTratamientos(true)
    try {
      const respuesta = await getTratamientosPorServicio(idServicioElegido)

      let listaDeTratamientos = respuesta.data
      if (!Array.isArray(respuesta.data)) {
        listaDeTratamientos = [respuesta.data]
      }
      setTratamientos(listaDeTratamientos)
    } catch (error) {
      console.error("No se logro cargar los tratamientos", error)
      setTratamientos([])
    } finally {
      setCargandoTratamientos(false)
    }
  }

  const diasDelMes = generarDiasDelMes(mesVisible)

  let horariosDisponibles = []
  if (diaSeleccionado) {
    horariosDisponibles = generarHorariosDelDia(diaSeleccionado)
  }

  const irAlMesAnterior = () => {
    setMesVisible((mesActual) => {
      return new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1)
    })
  }

  const irAlMesSiguiente = () => {
    setMesVisible((mesActual) => {
      return new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1)
    })
  }

  const elegirDia = (fecha) => {
    if (!fecha) {
      return
    }
    if (yaPaso(fecha)) {
      return
    }
    setDiaSeleccionado(fecha)
    setHoraSeleccionada(null)
  }

  const limpiarFormulario = () => {
    let idUsuarioParaElFormulario = ''
    if (esPaciente && usuario && usuario.id_usuario) {
      idUsuarioParaElFormulario = usuario.id_usuario
    }

    let idProfesionalParaElFormulario = ''
    if (esProfesional && usuario && usuario.id_usuario) {
      idProfesionalParaElFormulario = usuario.id_usuario
    }

    setFormulario({
      id_usuario: idUsuarioParaElFormulario,
      id_profesional: idProfesionalParaElFormulario,
      id_servicio: '',
      cod_tratamiento: '',
      observaciones: '',
    })
    setTratamientos([])
    setDiaSeleccionado(null)
    setHoraSeleccionada(null)
  }

  const reservar = async (evento) => {
    evento.preventDefault()
    setErrorFormulario('')

    if (!diaSeleccionado || !horaSeleccionadaValida) {
      setErrorFormulario("Selecciona un día y un horario en el calendario.")
      return
    }

    setEnviando(true)

    try {
      let observacionesParaEnviar = formulario.observaciones
      if (esPaciente) {
        observacionesParaEnviar = ''
      }

      const asignacion = await asignarTratamiento({
        id_usuario: Number(formulario.id_usuario),
        id_profesional: Number(formulario.id_profesional),
        cod_tratamiento: Number(formulario.cod_tratamiento),
        observaciones: observacionesParaEnviar,
      })

      let idAsignacion = null
      if (asignacion.data) {
        idAsignacion = asignacion.data.id_asignacion
      }

      if (!idAsignacion) {
        throw new Error("No se logro obtener el id de la asignación creada")
      }

      await crearReserva({
        dia: fechaAtexto(diaSeleccionado),
        hora: horaSeleccionadaValida,
        tiempo_estimado: '01:00',
        id_asignacion: idAsignacion,
      })

      limpiarFormulario()
      setMostrarExito(true)
    } catch (errorCapturado) {
      setErrorFormulario(errorCapturado.message)
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



  let claseContenedorSelectorPersonas = 'grid grid-cols-2 gap-4'
  if (esPaciente || esProfesional) {
    claseContenedorSelectorPersonas = 'grid grid-cols-1 gap-4'
  }

  let textoOpcionTratamiento = 'Selecciona un tratamiento'
  if (cargandoTratamientos) {
    textoOpcionTratamiento = 'Cargando...'
  }

  let textoBotonReservar = 'Reservar'
  if (enviando) {
    textoBotonReservar = 'Reservando...'
  }

   return (
    <div className="max-w-4xl mx-auto">
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
          <div className={claseContenedorSelectorPersonas}>
            {!esPaciente && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Paciente</label>
                <select name="id_usuario" value={formulario.id_usuario} onChange={actualizarCampo} required className="w-full border rounded-lg p-2 text-sm">
                  <option value="">Selecciona un paciente</option>
                  {pacientes.map((paciente) => (
                    <option key={paciente.id_usuario} value={paciente.id_usuario}>{paciente.nombre} {paciente.apellido}</option>
                  ))}
                </select>
              </div>
            )}

            {!esProfesional && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Profesional</label>
                <select name="id_profesional" value={formulario.id_profesional} onChange={actualizarCampo} required className="w-full border rounded-lg p-2 text-sm">
                  <option value="">Selecciona un profesional</option>
                  {profesionales.map((profesionalActual) => (
                    <option key={profesionalActual.id_usuario} value={profesionalActual.id_usuario}>{profesionalActual.nombre} {profesionalActual.apellido}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Servicio</label>
              <select name="id_servicio" value={formulario.id_servicio} onChange={cambiarServicio} required className="w-full border rounded-lg p-2 text-sm">
                <option value="">Selecciona un servicio</option>
                {servicios.map((servicioActual) => (
                  <option key={servicioActual.id_servicio} value={servicioActual.id_servicio}>{servicioActual.tipo_servicio}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tratamiento</label>
              <select
                name="cod_tratamiento"
                value={formulario.cod_tratamiento}
                onChange={actualizarCampo}
                required
                disabled={!formulario.id_servicio || cargandoTratamientos}
                className="w-full border rounded-lg p-2 text-sm disabled:bg-gray-100"
              >
                <option value="">{textoOpcionTratamiento}</option>
                {tratamientos.map((tratamientoActual) => (
                  <option key={tratamientoActual.cod_tratamiento} value={tratamientoActual.cod_tratamiento}>{tratamientoActual.descripcion} (${tratamientoActual.costo})</option>
                ))}
              </select>
            </div>
          </div>

          {!esPaciente && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Observaciones</label>
              <textarea name="observaciones" value={formulario.observaciones} onChange={actualizarCampo} placeholder="Opcional" className="w-full border rounded-lg p-2 text-sm" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Fecha y hora</label>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={irAlMesAnterior} className="text-gray-400 hover:text-gray-700 px-2">‹</button>
                <span className="text-sm font-semibold text-gray-700">
                  {nombre_meses[mesVisible.getMonth()]} {mesVisible.getFullYear()}
                </span>
                <button type="button" onClick={irAlMesSiguiente} className="text-gray-400 hover:text-gray-700 px-2">›</button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-1">
                {nombre_dias.map((dia) => <div key={dia}>{dia}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {diasDelMes.map((fecha, indice) => {
                  if (!fecha) {
                    return <div key={'vacio-' + indice} />
                  }

                  const pasado = yaPaso(fecha)
                  const seleccionado = esElMismoDia(fecha, diaSeleccionado)

                  let clase = 'text-sm p-2 rounded-lg text-gray-600 hover:bg-[#505FB6]/10'
                  if (pasado) {
                    clase = 'text-sm p-2 rounded-lg text-gray-300 cursor-not-allowed'
                  }
                  if (seleccionado) {
                    clase = 'text-sm p-2 rounded-lg bg-[#505FB6] text-white'
                  }

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
                    const ocupada = horasOcupadas.includes(hora)
                    const seleccionada = horaSeleccionadaValida === hora

                    let clase = 'text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-[#505FB6]'
                    if (ocupada) {
                      clase = 'text-xs px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-300 line-through cursor-not-allowed'
                    } else if (seleccionada) {
                      clase = 'text-xs px-3 py-2 rounded-lg border border-[#505FB6] bg-[#505FB6] text-white'
                    }

                    return (
                      <button
                        type="button"
                        key={hora}
                        onClick={() => setHoraSeleccionada(hora)}
                        disabled={ocupada}
                        className={clase}
                      >
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
              {textoBotonReservar}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Reservas