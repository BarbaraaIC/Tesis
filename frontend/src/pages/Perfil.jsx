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
    { name: 'edad', label: 'Edad', tipo: 'number' },
    { name: 'ocupacion', label: 'Ocupación', tipo: 'text' },
    { name: 'enfermedades', label: 'Enfermedades', tipo: 'textarea' },
    { name: 'medicamentos', label: 'Medicamentos', tipo: 'text'},
    ]

function obtenerValorOTextoVacio(valor) {
    if (valor) {
        return valor
    }
    return ''
}



function armarFormDesdeUsuario(usuario) {
    return {
        nombre: obtenerValorOTextoVacio(usuario.nombre),
        apellido: obtenerValorOTextoVacio(usuario.apellido),
        rut: obtenerValorOTextoVacio(usuario.rut),
        correo: obtenerValorOTextoVacio(usuario.correo),
        telefono: obtenerValorOTextoVacio(usuario.telefono),
        direccion: obtenerValorOTextoVacio(usuario.direccion),
        edad: obtenerValorOTextoVacio(usuario.edad),
        ocupacion: obtenerValorOTextoVacio(usuario.ocupacion),
        enfermedades: obtenerValorOTextoVacio(usuario.enfermedades),
        medicamentos: obtenerValorOTextoVacio(usuario.medicamentos),
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
        let valor = evento.target.value

        if (nombreCampo === 'edad') {
            valor = valor.replace(/[^0-9]/g, '')
            if (valor !== '' && Number(valor) > 99) {
                valor = '99'
            }
        }

        setForm((formularioAnterior) => {
            return { ...formularioAnterior, [nombreCampo]: valor }
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

        if (form.edad !== '') {
            const edadNumero = Number(form.edad)
            if (edadNumero < 1 || edadNumero > 99) {
                setError('La edad debe ser un número entre 1 y 99.')
                return
            }
        }

        setGuardando(true)

        try {
            let edadParaEnviar = null
            if (form.edad !== '') {
                edadParaEnviar = Number(form.edad)
            }

            const datosAEnviar = {
                ...form,
                edad: edadParaEnviar,
            }

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
                    const valor = usuario[campo.name]

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
        if (campo.name === 'rut') {
            return (
                <input
                    type="text"
                    name={campo.name}
                    value={form[campo.name]}
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

                if (campo.name === 'nombre') {
            return (
                <input
                    type="text"
                    name={campo.name}
                    value={form[campo.name]}
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

        
                if (campo.name === 'apellido') {
            return (
                <input
                    type="text"
                    name={campo.name}
                    value={form[campo.name]}
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

        let tipoDeInput = campo.tipo
        let modoDeEntrada = undefined
        if (campo.name === 'edad') {
            tipoDeInput = 'text'
            modoDeEntrada = 'numeric'
        }

        return (
            <input
                type={tipoDeInput}
                inputMode={modoDeEntrada}
                name={campo.name}
                value={form[campo.name]}
                onChange={actualizarCampo}
                className="w-full border rounded-lg p-2 text-sm"
            />
        )
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

    let textoBotonGuardar = 'Guardar cambios'
    if (guardando) {
        textoBotonGuardar = 'Guardando...'
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
            </div>
        </div>
    )
}

export default Perfil