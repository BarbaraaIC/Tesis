import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/usuarios/useAuth.jsx'
import { actualizarUsuario } from '../services/usuariosServices.jsx'

const campos = [
    { name: 'nombre', label: 'Nombre', tipo: 'text' },
    { name: 'apellido', label: 'Apellido', tipo: 'text' },
    { name: 'rut', label: 'Rut', tipo: 'text' },
    { name: 'correo', label: 'Correo', tipo: 'email' },
    { name: 'telefono', label: 'Teléfono', tipo: 'text' },
    { name: 'direccion', label: 'Dirección', tipo: 'text' },
    { name: 'fecha_nacimiento', label: 'Fecha de nacimiento', tipo: 'text' },
    { name: 'ocupacion', label: 'Ocupación', tipo: 'text' },
    { name: 'enfermedades', label: 'Enfermedades', tipo: 'textarea' },
    { name: 'medicamentos', label: 'Medicamentos', tipo: 'text'},
    ]

// Campos que solo se pueden visualizar
const camposBloqueados = ['nombre', 'apellido', 'rut', 'fecha_nacimiento']

const TEXTO_AUTORIZACION =
    'Autorizo que mis datos de salud, como enfermedades y medicamentos, sean utilizados con fines médicos.'

function obtenerValorOTextoVacio(valor) {
    if (valor) {
        return valor
    }
    return ''
}

function formatearFecha(valor) {
    if (!valor) {
        return ''
    }
    const soloFecha = String(valor).slice(0, 10)
    const partes = soloFecha.split('-')
    if (partes.length !== 3) {
        return String(valor)
    }
    const [anio, mes, dia] = partes
    return `${dia}/${mes}/${anio}`
}

function armarFormDesdeUsuario(usuario) {
    return {
        nombre: obtenerValorOTextoVacio(usuario.nombre),
        apellido: obtenerValorOTextoVacio(usuario.apellido),
        rut: obtenerValorOTextoVacio(usuario.rut),
        correo: obtenerValorOTextoVacio(usuario.correo),
        telefono: obtenerValorOTextoVacio(usuario.telefono),
        direccion: obtenerValorOTextoVacio(usuario.direccion),
        fecha_nacimiento: formatearFecha(usuario.fecha_nacimiento),
        ocupacion: obtenerValorOTextoVacio(usuario.ocupacion),
        enfermedades: obtenerValorOTextoVacio(usuario.enfermedades),
        medicamentos: obtenerValorOTextoVacio(usuario.medicamentos),
        autoriza_datos_salud: Boolean(usuario.autoriza_datos_salud),
    }
}

function obtenerClaseColumna(campo) {
    if (campo.tipo === 'textarea') {
        return 'col-span-2'
    }
    return ''
}

const Perfil = () => {
    const { usuario, setUsuario } = useAuth()

    const [modoEdicion, setModoEdicion] = useState(false)
    const [form, setForm] = useState(null)
    const [nuevaPassword, setNuevaPassword] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [error, setError] = useState('')
    const [mostrarExito, setMostrarExito] = useState(false)


    useEffect(() => {
        if (!mostrarExito) {
            return
        }
        const timer = setTimeout(() => setMostrarExito(false), 3000)
        return () => clearTimeout(timer)
    }, [mostrarExito])

    if (!usuario) {
        return <p>Cargando perfil...</p>
    }

    const empezarEdicion = () => {
        setForm(armarFormDesdeUsuario(usuario))
        setModoEdicion(true)
    }

    const actualizarCampo = (evento) => {
        const nombreCampo = evento.target.name
        const valor = evento.target.value

        setForm((formularioAnterior) => {
            return { ...formularioAnterior, [nombreCampo]: valor }
        })
    }

    const yaAutorizo = Boolean(usuario.autoriza_datos_salud)

    const actualizarAutorizacion = (evento) => {
        if (yaAutorizo) {
            return
        }

        const marcado = evento.target.checked

        setForm((formularioAnterior) => {
            return { ...formularioAnterior, autoriza_datos_salud: marcado }
        })
    }

    const cancelarEdicion = () => {
        setNuevaPassword('')
        setError('')
        setModoEdicion(false)
        setForm(null)
    }

    const guardarCambios = async (evento) => {
        evento.preventDefault()
        setError('')

        const tieneDatosDeSalud =
            form.enfermedades.trim() !== '' || form.medicamentos.trim() !== ''

        if (tieneDatosDeSalud && !form.autoriza_datos_salud) {
            setError('Para guardar tus datos de salud debes marcar la casilla de autorización.')
            return
        }

        setGuardando(true)

        try {
            // eslint-disable-next-line no-unused-vars
            const { fecha_nacimiento, ...datosAEnviar } = form

            if (nuevaPassword.trim() !== '') {
                datosAEnviar.password = nuevaPassword
            }

            const respuesta = await actualizarUsuario(usuario.id_usuario, datosAEnviar)

            if (setUsuario) {
                let datosActualizados = datosAEnviar
                if (respuesta && respuesta.data) {
                    datosActualizados = respuesta.data
                }
                const usuarioNuevo = { ...usuario, ...datosActualizados }
                setUsuario(usuarioNuevo)
            }

            setNuevaPassword('')
            setModoEdicion(false)
            setForm(null)
            setMostrarExito(true)
        } catch (errorCapturado) {
            let mensaje = 'No se pudo actualizar el perfil'
            if (errorCapturado.message) {
                mensaje = errorCapturado.message
            }
            setError(mensaje)
        } finally {
            setGuardando(false)
        }
    }

    const renderizarVistaPerfil = () => {
        return (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {campos.map((campo) => {
                    let valor = usuario[campo.name]
                    if (campo.name === 'fecha_nacimiento') {
                        valor = formatearFecha(valor)
                    }

                    let textoAMostrar = '—'
                    if (valor) {
                        textoAMostrar = valor
                    }

                    return (
                        <div key={campo.name} className={obtenerClaseColumna(campo)}>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{campo.label}</p>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{textoAMostrar}</p>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderizarCampoDeEdicion = (campo) => {
        if (camposBloqueados.includes(campo.name)) {
            let valorMostrado = form[campo.name]
            if (campo.name === 'fecha_nacimiento') {
                valorMostrado = formatearFecha(valorMostrado)
            }

            return (
                <input
                    type="text"
                    name={campo.name}
                    value={valorMostrado}
                    disabled
                    className="w-full border rounded-lg p-2 text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                />
            )
        }

        if (campo.tipo === 'textarea') {
            return (
                <textarea
                    name={campo.name}
                    value={form[campo.name]}
                    onChange={actualizarCampo}
                    placeholder="Sin enfermedades registradas"
                    className="w-full border rounded-lg p-2 text-sm"
                    rows={3}
                />
            )
        }

        return (
            <input
                type={campo.tipo}
                name={campo.name}
                value={form[campo.name]}
                onChange={actualizarCampo}
                className="w-full border rounded-lg p-2 text-sm"
            />
        )
    }

    let textoBotonGuardar = 'Guardar cambios'
    if (guardando) {
        textoBotonGuardar = 'Guardando...'
    }

    const renderizarFormularioEdicion = () => {
        return (
            <form onSubmit={guardarCambios} className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                    {campos.map((campo) => (
                        <div key={campo.name} className={obtenerClaseColumna(campo)}>
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                {campo.label}
                            </label>
                            {renderizarCampoDeEdicion(campo)}
                        </div>
                    ))}

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            value={nuevaPassword}
                            onChange={(evento) => setNuevaPassword(evento.target.value)}
                            placeholder="Cambio de contraseña"
                            className="w-full border rounded-lg p-2 text-sm"
                        />
                    </div>
                </div>

                <label
                    className={
                        'flex items-start gap-3 text-sm ' +
                        (yaAutorizo ? 'text-gray-600 cursor-not-allowed' : 'text-gray-700 cursor-pointer')
                    }
                >
                    <input
                        type="checkbox"
                        checked={form.autoriza_datos_salud}
                        onChange={actualizarAutorizacion}
                        disabled={yaAutorizo}
                        className={
                            'mt-0.5 h-5 w-5 shrink-0 rounded border-gray-300 accent-[#505FB6] ' +
                            (yaAutorizo ? 'cursor-not-allowed' : 'cursor-pointer')
                        }
                    />
                    <span>
                        {TEXTO_AUTORIZACION}
                        {yaAutorizo && (
                            <span className="block text-xs text-gray-500 mt-1">
                                Ya aceptaste esta autorización.
                            </span>
                        )}
                    </span>
                </label>

                <div className="flex justify-end gap-3 mt-2">
                    <button
                        type="button"
                        onClick={cancelarEdicion}
                        disabled={guardando}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={guardando}
                        className="px-4 py-2 rounded-lg bg-[#505FB6] text-white text-sm font-medium hover:bg-[#3f4d9e] disabled:opacity-50"
                    >
                        {textoBotonGuardar}
                    </button>
                </div>
            </form>
        )
    }

    let contenidoPrincipal = renderizarVistaPerfil()
    if (modoEdicion) {
        contenidoPrincipal = renderizarFormularioEdicion()
    }

    return (
        <div className="w-full flex justify-center items-start min-h-screen px-4 py-8">
            <div className="max-w-3xl w-full">
                {mostrarExito && (
                    <div className="fixed bottom-4 right-4 flex items-center gap-3 bg-green-50 text-green-800 px-4 py-3 rounded-lg shadow-md border border-green-100 min-w-[300px]">
                    <span className="flex items-center justify-center w-5 h-5 bg-green-500 text-white rounded-full flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </span>
                    <span className="flex-1 text-sm font-medium">Perfil actualizado con éxito</span>
                    <button onClick={() => setMostrarExito(false)} className="text-green-600 hover:text-green-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    </div>
                )}

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Mi perfil</h2>

                    {!modoEdicion && (
                    <button
                        onClick={empezarEdicion}
                        className="px-4 py-2 rounded-lg bg-[#505FB6] text-white text-sm font-medium hover:bg-[#3f4d9e]"
                    >
                        Editar perfil
                    </button>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                    {contenidoPrincipal}
                </div>

                {!modoEdicion && (
                    <p className="mt-4 flex items-start gap-2 text-xs text-gray-600">
                        {usuario.autoriza_datos_salud ? (
                            <>
                                <span aria-hidden="true" className="font-bold text-green-700">✓</span>
                                <span>Autorizaste que tus datos de salud, como enfermedades y medicamentos, sean utilizados con fines médicos.</span>
                            </>
                        ) : (
                            <>
                                <span aria-hidden="true">○</span>
                                <span>Aún no has autorizado el uso de tus datos de salud con fines médicos. Puedes hacerlo en "Editar perfil".</span>
                            </>
                        )}
                    </p>
                )}
            </div>
        </div>
    )
}

export default Perfil