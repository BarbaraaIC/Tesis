import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/usuarios/useAuth.jsx'
import { getReservasPorUsuario } from '../services/reservasServices.jsx'

const nombre_meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function formatearFechaLegible(textoFecha) {
  if (!textoFecha) {
    return '—'
  }

  const soloFecha = textoFecha.split('T')[0] 
  const partes = soloFecha.split('-')
  if (partes.length !== 3) {
    return textoFecha
  }

  const año = partes[0]
  const mes = Number(partes[1])
  const dia = Number(partes[2])

  return `${dia} de ${nombre_meses[mes - 1]} de ${año}`
}

function formatearHora(textoHora) {
  if (!textoHora) {
    return '—'
  }

  const partes = textoHora.split('T')
  if (partes.length !== 2) {
    return textoHora
  }

  return partes[1].substring(0, 5) 
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

function obtenerDescripcionTratamiento(reserva) {
  if (reserva.asignacion && reserva.asignacion.tratamiento) {
    return reserva.asignacion.tratamiento.descripcion
  }
  if (reserva.tratamiento) {
    return reserva.tratamiento.descripcion
  }
  return '—'
}

function ordenarPorFechaYHora(reservas) {
  const copia = [...reservas]
  copia.sort((reservaA, reservaB) => {
    const claveA = `${reservaA.dia} ${reservaA.hora}`
    const claveB = `${reservaB.dia} ${reservaB.hora}`
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

const MisReservas = () => {
  const { usuario } = useAuth()

  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

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
       const respuesta = await getReservasPorUsuario(usuario.id_usuario)
        setReservas(respuesta.data)
      } catch (errorCapturado) {
        setError(errorCapturado.message)
      } finally {
        setCargando(false)
      }
    }

    cargarReservas()
  }, [usuario])

  if (cargando) {
    return <p>Cargando tus horas reservadas...</p>
  }

  if (error) {
    return <p className="text-red-500">{error}</p>
  }

  const reservasOrdenadas = ordenarPorFechaYHora(reservas)

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mis horas reservadas</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#04B6B6] text-left text-black-500 uppercase text-xs tracking-wide">
              <th className="p-3 font-semibold">Fecha</th>
              <th className="p-3 font-semibold">Hora</th>
              <th className="p-3 font-semibold">Profesional</th>
              <th className="p-3 font-semibold">Tratamiento</th>
            </tr>
          </thead>
          <tbody>
            {reservasOrdenadas.map((reserva, indice) => {
              let filaClase = 'border-t border-gray-100'
              if (indice % 2 === 1) {
                filaClase = 'border-t border-gray-100 bg-gray-50/50'
              }

              return (
                <tr key={reserva.id_reserva} className={filaClase}>
                  <td className="p-3 text-gray-800">{formatearFechaLegible(reserva.dia)}</td>
                  <td className="p-3 text-gray-600">{formatearHora(reserva.hora)}</td>
                  <td className="p-3 text-gray-600">{obtenerNombreProfesional(reserva)}</td>
                  <td className="p-3 text-gray-600">{obtenerDescripcionTratamiento(reserva)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {reservasOrdenadas.length === 0 && (
          <p className="p-6 text-center text-gray-400 text-sm">Aún no tienes horas reservadas.</p>
        )}
      </div>
    </div>
  )
}

export default MisReservas