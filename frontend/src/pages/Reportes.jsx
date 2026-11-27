import { useEffect, useState } from 'react'
import { getReporte } from '../services/reportesServices.jsx'

const agrupaciones = [
    { valor: 'dia', texto: 'Día' },
    { valor: 'semana', texto: 'Semana' },
    { valor: 'mes', texto: 'Mes' },
]

const opciones_inactividad = [30, 60, 90, 180]

const aTexto = (fecha) => {
const y = fecha.getFullYear()
const m = String(fecha.getMonth() + 1).padStart(2, '0')
const d = String(fecha.getDate()).padStart(2, '0')
return `${y}-${m}-${d}`
    }

const rangoUltimosDias = (dias) => {
const hasta = new Date()
const desde = new Date()
    desde.setDate(desde.getDate() - (dias - 1))
    return { desde: aTexto(desde), hasta: aTexto(hasta) }
    }

const rangoEsteMes = () => {
const hoy = new Date()
    return { desde: aTexto(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), hasta: aTexto(hoy) }
    }

const rangoEsteAnio = () => {
const hoy = new Date()
    return { desde: aTexto(new Date(hoy.getFullYear(), 0, 1)), hasta: aTexto(hoy) }
    }

const rangos = [
    { texto: '7 días', rango: () => rangoUltimosDias(7) },
    { texto: '30 días', rango: () => rangoUltimosDias(30) },
    { texto: 'Este mes', rango: rangoEsteMes },
    { texto: 'Este año', rango: rangoEsteAnio },
]

const diaCorto = (texto) =>
    new Date(`${texto}T00:00:00Z`)
        .toLocaleDateString('es-CL', { timeZone: 'UTC', day: 'numeric', month: 'short' })
        .replace('.', '')

const diaConAnio = (texto) => `${diaCorto(texto)} ${texto.slice(0, 4)}`

const etiquetaPeriodo = (periodo, agrupar) => {
    if (agrupar === 'mes') {
        const fecha = new Date(`${periodo}-01T00:00:00Z`)
        return fecha.toLocaleDateString('es-CL', { timeZone: 'UTC', month: 'short', year: '2-digit' }).replace('.', '')
    }
    // En semana se muestra el lunes en que empieza (el selector ya dice "Semana")
    return diaCorto(periodo)
    }

const enlaceWhatsApp = (telefono) => {
    let numero = String(telefono || '').replace(/\D/g, '')
    if (numero.length === 9 && numero.startsWith('9')) {
        numero = `56${numero}`
    }
    return numero ? `https://wa.me/${numero}` : null
    }

const Tarjeta = ({ titulo, derecha, children }) => (
    <section className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-semibold text-gray-800">{titulo}</h2>
        {derecha}
        </div>
        {children}
    </section>
    )

const Cifra = ({ titulo, valor, detalle }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase">{titulo}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{valor}</p>
        {detalle && <p className="text-xs text-gray-400 mt-1">{detalle}</p>}
    </div>
    )

const claseCampo = 'border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white'

    function Reportes() {
    const [rango, setRango] = useState(() => rangoUltimosDias(30))
    const [agrupar, setAgrupar] = useState('dia')
    const [inactividad, setInactividad] = useState(60)

    const [datos, setDatos] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let vigente = true

        const cargar = async () => {
        setCargando(true)
        setError('')
        try {
            const respuesta = await getReporte({ desde: rango.desde, hasta: rango.hasta, agrupar, inactividad })
            if (vigente) setDatos(respuesta.data)
        } catch (errorCapturado) {
            if (vigente) setError(errorCapturado.message)
        } finally {
            if (vigente) setCargando(false)
        }
        }

        cargar()
        return () => {
        vigente = false
        }
    }, [rango, agrupar, inactividad])

    const cambiarFecha = (campo, valor) => {
        if (!valor) return
        setRango((anterior) => ({ ...anterior, [campo]: valor }))
    }

const resumen = datos?.resumen
const maximoSerie = datos ? Math.max(1, ...datos.serie.map((punto) => punto.sesiones)) : 1
const maximoTratamiento = datos ? Math.max(1, ...datos.porTratamiento.map((t) => t.sesiones)) : 1

    return (
        <div className="w-full min-w-0 max-w-6xl mx-auto flex flex-col gap-6">
        <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Reportes</h2>
            <p className="text-sm text-gray-500">Solo se cuentan las sesiones a las que el paciente asistió.</p>
        </div>

        <section className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
            {rangos.map((atajo) => (
                <button
                key={atajo.texto}
                type="button"
                onClick={() => setRango(atajo.rango())}
                className="px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-[#505FB6] hover:text-[#505FB6] cursor-pointer"
                >
                {atajo.texto}
                </button>
            ))}
            </div>

            <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-semibold text-gray-500 uppercase">
                Desde
                <input
                type="date"
                value={rango.desde}
                max={rango.hasta}
                onChange={(evento) => cambiarFecha('desde', evento.target.value)}
                className={`${claseCampo} block mt-1 normal-case font-normal`}
                />
            </label>
            <label className="text-xs font-semibold text-gray-500 uppercase">
                Hasta
                <input
                type="date"
                value={rango.hasta}
                min={rango.desde}
                onChange={(evento) => cambiarFecha('hasta', evento.target.value)}
                className={`${claseCampo} block mt-1 normal-case font-normal`}
                />
            </label>
            </div>
        </section>

        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        {!datos && cargando && <p className="text-sm text-gray-500">Cargando reporte</p>}

        {datos && (
            <div className={`flex flex-col gap-6 transition-opacity ${cargando ? 'opacity-60' : ''}`}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Cifra titulo="Sesiones realizadas" valor={resumen.sesionesRealizadas} />
                <Cifra titulo="Pacientes atendidos" valor={resumen.pacientesAtendidos} detalle="Personas distintas" />
                <Cifra
                titulo="Asistencia"
                valor={resumen.porcentajeAsistencia === null ? '—' : `${resumen.porcentajeAsistencia}%`}
                detalle="Sobre las sesiones registradas"
                />
                <Cifra titulo="No asistieron" valor={resumen.noAsistio} />
            </div>

            <Tarjeta
                titulo="Sesiones en el tiempo"
                derecha={
                <div role="group" aria-label="Agrupar por" className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {agrupaciones.map((opcion) => (
                    <button
                        key={opcion.valor}
                        type="button"
                        onClick={() => setAgrupar(opcion.valor)}
                        aria-pressed={agrupar === opcion.valor}
                        className={`px-3 py-1.5 text-sm cursor-pointer ${
                        agrupar === opcion.valor ? 'bg-[#505FB6] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {opcion.texto}
                    </button>
                    ))}
                </div>
                }
            >
                {resumen.sesionesRealizadas === 0 ? (
                <p className="text-sm text-gray-500">No hay sesiones realizadas en este rango.</p>
                ) : (
                <div className="overflow-x-auto pb-2">
                    <ul className="flex items-end gap-2 h-52 min-w-full w-max pt-6">
                    {datos.serie.map((punto) => (
                        <li key={punto.periodo} className={`flex flex-col items-center justify-end h-full shrink-0 ${agrupar === 'dia' ? 'w-10' : 'w-14'}`}>
                        <span className="text-xs text-gray-600 mb-1">{punto.sesiones || ''}</span>
                        <div
                            className="w-full rounded-t bg-[#04B6B6]"
                            style={{ height: `${(punto.sesiones / maximoSerie) * 100}%`, minHeight: punto.sesiones ? 4 : 2, opacity: punto.sesiones ? 1 : 0.25 }}
                            title={`${etiquetaPeriodo(punto.periodo, agrupar)}: ${punto.sesiones}`}
                        />
                        <span className="text-[10px] text-gray-500 mt-1 whitespace-nowrap">
                            {etiquetaPeriodo(punto.periodo, agrupar)}
                        </span>
                        </li>
                    ))}
                    </ul>
                    {agrupar === 'semana' && (
                    <p className="text-xs text-gray-400 mt-2">Cada barra es una semana; la fecha es el lunes en que empieza.</p>
                    )}
                </div>
                )}
            </Tarjeta>

            <Tarjeta titulo="Sesiones por tratamiento">
                {datos.porTratamiento.length === 0 ? (
                <p className="text-sm text-gray-500">No hay sesiones realizadas en este rango.</p>
                ) : (
                <ul className="flex flex-col gap-3">
                    {datos.porTratamiento.map((fila) => (
                    <li key={fila.tratamiento}>
                        <div className="flex items-center justify-between gap-3 text-sm mb-1">
                        <span className="min-w-0 break-words text-gray-700">{fila.tratamiento}</span>
                        <span className="shrink-0 font-semibold text-gray-800">{fila.sesiones}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                        <div className="h-2 bg-[#505FB6] rounded-full" style={{ width: `${(fila.sesiones / maximoTratamiento) * 100}%` }} />
                        </div>
                    </li>
                    ))}
                </ul>
                )}
            </Tarjeta>

            <Tarjeta
                titulo="Pacientes sin agendar"
                derecha={
                <label className="text-sm text-gray-600 flex items-center gap-2">
                    Sin reservar hace más de
                    <select
                    value={inactividad}
                    onChange={(evento) => setInactividad(Number(evento.target.value))}
                    className={claseCampo}
                    >
                    {opciones_inactividad.map((dias) => (
                        <option key={dias} value={dias}>{dias} días</option>
                    ))}
                    </select>
                </label>
                }
            >
                {datos.pacientesSinAgendar.length === 0 ? (
                <p className="text-sm text-gray-500">Todos los pacientes tienen reservas recientes o próximas.</p>
                ) : (
                <>
                    <p className="text-xs text-gray-400 mb-3">
                    {datos.pacientesSinAgendar.length} paciente(s), sin reservas próximas. Este listado no depende del rango de fechas.
                    </p>
                    <ul className="flex flex-col divide-y divide-gray-100">
                    {datos.pacientesSinAgendar.map((paciente) => {
                        const enlace = enlaceWhatsApp(paciente.telefono)
                        return (
                        <li key={paciente.id_usuario} className="flex flex-wrap items-center justify-between gap-2 py-3">
                            <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 break-words">
                                {paciente.nombre} {paciente.apellido}
                            </p>
                            <p className="text-xs text-gray-500">
                                {paciente.ultimaReserva
                                ? `Última reserva: ${diaConAnio(paciente.ultimaReserva)} · hace ${paciente.diasSinAgendar} días`
                                : 'Aún no tiene reservas'}
                            </p>
                            </div>
                            {enlace && (
                            <a
                                href={enlace}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600"
                            >
                                WhatsApp
                            </a>
                            )}
                        </li>
                        )
                    })}
                    </ul>
                </>
                )}
            </Tarjeta>
            </div>
        )}
        </div>
    )
    }

export default Reportes