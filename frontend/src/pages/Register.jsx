import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ocupaciones = [
    'Estudiante',
    'Docencia',
    'Trabajador/a independiente',
    'Dueño/a de empresa',
    'Administración',
    'Ingeniería',
    'Profesional salud',
    'Obrero',
    'Otra',
]

const rut_val = /^\d{1,2}\.\d{3}\.\d{3}-[0-9kK]{1}$/
const correo_val = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const telefono_val = /^(?:\+?56)?9[0-9]{8}$/
const password_val = /^(?=.*\d)[^.,?= \s]{8,30}$/
const ocupacion_val = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s/\-.]+$/
const direccion_val = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9.,#-]+(?:\s[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9.,#-]+)*$/
const nombre_val = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$/
const apellido_val = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$/

function Register (){
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [error, setError] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [nombre, setNombre] = useState('')
    const [apellido, setApellido] = useState('')
    const [rut, setRut] = useState('')
    const [correo, setCorreo] = useState('')
    const [telefono, setTelefono] = useState('')
    const [password, setPassword] = useState('')
    const [edad, setEdad] = useState('')
    const [direccion, setDireccion] = useState('')
    const [tieneEnfermedades, setTieneEnfermedades] = useState('no')
    const [enfermedades, setEnfermedades] = useState('')
    const [tieneMedicamentos, setTieneMedicamentos] = useState('no')
    const [medicamentos, setMedicamentos] = useState('')
    const [ocupacion, setOcupacion] = useState('')
    const [ocupacionOtra, setOcupacionOtra] = useState('')


    const validarPaso1 = () => {
        if (nombre.trim().length < 3 || !nombre_val.test(nombre.trim())) {
            return 'El nombre debe tener al menos 3 caracteres y solo puede contener letras.'
        }
        if (apellido.trim().length < 3 || !apellido_val.test(apellido.trim())) {
            return 'El apellido debe tener al menos 3 caracteres y solo puede contener letras.'
        }
        if (!rut_val.test(rut.trim())) {
            return 'El RUT debe tener el formato xx.xxx.xxx-x (ej: 12.345.678-9).'
        }
        const edadNumero = Number(edad)
        if (!edad || edadNumero < 1 || edadNumero > 99) {
            return 'Ingresa una edad válida (entre 1 y 99).'
        }
        return ''
    }

    const validarPaso2 = () => {
        if (!correo_val.test(correo.trim())) {
            return 'Ingresa un correo electrónico válido.'
        }
        if (!telefono_val.test(telefono.trim())) {
            return 'El celular debe empezar con 9 y tener 9 dígitos, ej: 912345678 o +56912345678.'
        }
        if (direccion.trim().length < 5 || !direccion_val.test(direccion.trim())) {
            return 'La dirección debe tener al menos 5 caracteres y solo letras, números, espacios, puntos, comas, # o guiones.'
        }
        if (!password_val.test(password)) {
            return 'La contraseña debe tener entre 8 y 30 caracteres'
        }
        return ''
    }

    const validarPaso3 = () => {
        if (!ocupacion) {
            return 'Selecciona una ocupación.'
        }
        if (ocupacion === 'Otra') {
            const otraTrim = ocupacionOtra.trim()
            if (otraTrim.length < 3 || !ocupacion_val.test(otraTrim)) {
                return 'La ocupación debe tener al menos 3 caracteres y solo puede contener letras, espacios, / o -'
            }
        }
        if (tieneEnfermedades === 'si' && !enfermedades.trim()) {
            return 'Describe brevemente el antecedente de salud.'
        }
        if (tieneMedicamentos === 'si' && !medicamentos.trim()) {
            return 'Describe los medicamentos que consumes.'
        }
        return ''
    }

    const irAlSiguientePaso = (siguientePaso) => {
        let mensajeError = ''

        if (step === 1) {
            mensajeError = validarPaso1()
        } else if (step === 2) {
            mensajeError = validarPaso2()
        }

        if (mensajeError) {
            setError(mensajeError)
            return
        }

        setError('')
        setStep(siguientePaso)
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        const mensajeErrorPaso3 = validarPaso3()
        if (mensajeErrorPaso3) {
            setError(mensajeErrorPaso3)
            return
        }

        const ocupacionFinal = ocupacion === 'Otra' ? ocupacionOtra : ocupacion

        setEnviando(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
            //const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre, apellido, rut, correo, telefono, password, edad, ocupacion: ocupacionFinal, direccion,
                enfermedades: tieneEnfermedades === 'no' ? null : enfermedades,
                medicamentos: tieneMedicamentos === 'no' ? null : medicamentos,
            }),
            })

            const data = await res.json()
                if (!res.ok) {
                    setError(data.message || 'Error al registrar.')
                        return
                }
                navigate('/login')
        } catch {
            setError('Error de conexión con el servidor')
        } finally {
            setEnviando(false)
        }
    }

return (
    <div className="min-h-screen flex items-center justify-center bg-[#04B6B6] px-4">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">¡Regístrate!</h2>

            <div className="flex justify-center gap-2 mb-6">
                <span className={`h-2 w-8 rounded-full ${step >= 1 ? 'bg-[#04B6B6]' : 'bg-gray-300'}`} />
                <span className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-[#04B6B6]' : 'bg-gray-300'}`} />
                <span className={`h-2 w-8 rounded-full ${step >= 3 ? 'bg-[#04B6B6]' : 'bg-gray-300'}`} />
            </div>

            {error && (
                <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
            )}
            {step === 1 && (
                <>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#505FB6]"
                        />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                        <input
                            type="text"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#505FB6]"
                        />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rut</label>
                        <input
                            type="text"
                            placeholder="12.345.678-9"
                            value={rut}
                            onChange={(e) => setRut(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#505FB6]"
                        />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                        <input
                            type="number"
                            min="1" max="99"
                            value={edad}
                            onChange={(e) => setEdad(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#505FB6]"
                        />
                </div>

                <button type="button" onClick={() => irAlSiguientePaso(2)} className="w-full bg-[#04B6B6] text-white py-2 rounded-lg font-medium hover:bg-[#3f4d9e] transition-colors cursor-pointer">
                    Siguiente
                </button>
                </>
            )}

            {step === 2 && (
                <>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                        <input
                            type="email"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#505FB6]"
                        />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                        <input
                            type="text"
                            placeholder="+56912345678"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#505FB6]"
                        />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <input
                            type="text"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#505FB6]"
                        />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#505FB6]"
                        />
                </div>

                <div className="flex gap-3">
                    <button type="button" onClick={() => { setError(''); setStep(1) }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors cursor-pointer">
                        Anterior
                    </button>
                    <button type="button" onClick={() => irAlSiguientePaso(3)} className="flex-1 bg-[#505FB6] text-white py-2 rounded-lg font-medium hover:bg-[#3f4d9e] transition-colors cursor-pointer">
                        Siguiente
                    </button>
                </div>
                </>
            )}
            {step === 3 && (
                <>
                
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ocupación</label>
                <select
                    value={ocupacion}
                    onChange={(e) => {
                        setOcupacion(e.target.value)
                        if (e.target.value !== 'Otra') {
                            setOcupacionOtra('')
                        }
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#505FB6]"
                >
                    <option value="">Selecciona una ocupación</option>
                    {ocupaciones.map((ocupacionActual) => (
                    <option key={ocupacionActual} value={ocupacionActual}>
                        {ocupacionActual}
                    </option>
                    ))}
            </select>

            {ocupacion === 'Otra' && (
                <input
                type="text"
                value={ocupacionOtra}
                onChange={(e) => setOcupacionOtra(e.target.value)}
                placeholder="Especifica tu ocupación"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-[#505FB6]"
                />
            )}
            </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">¿Algún antecedente de salud diagnosticado?</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="tieneEnfermedades" value="no" checked={tieneEnfermedades === 'no'} onChange={() => setTieneEnfermedades('no')} /> No
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="tieneEnfermedades" value="si" checked={tieneEnfermedades === 'si'} onChange={() => setTieneEnfermedades('si')} /> Sí
                        </label>
                    </div>
                    {tieneEnfermedades === 'si' && (
                        <textarea
                            value={enfermedades}
                            onChange={(e) => setEnfermedades(e.target.value)}
                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#505FB6]"
                            rows="2"
                        />
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">¿Consume medicamentos?(describa)</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="tieneMedicamentos" value="no" checked={tieneMedicamentos === 'no'} onChange={() => setTieneMedicamentos('no')} /> No
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                            <input type="radio" name="tieneMedicamentos" value="si" checked={tieneMedicamentos === 'si'} onChange={() => setTieneMedicamentos('si')} /> Sí
                        </label>
                    </div>
                        {tieneMedicamentos === 'si' && (
                            <textarea
                            value={medicamentos}
                        onChange={(e) => setMedicamentos(e.target.value)}
                        className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#505FB6]"
                        rows="2"
                    />
                    )}
                </div>

                <div className="flex gap-3">
                    <button type="button" onClick={() => { setError(''); setStep(2) }} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors cursor-pointer">
                        Anterior
                    </button>
                    <button type="submit" disabled={enviando} className="flex-1 bg-[#505FB6] text-white py-2 rounded-lg font-medium hover:bg-[#3f4d9e] transition-colors cursor-pointer disabled:opacity-50">
                        {enviando ? 'Registrando...' : 'Registrar'}
                    </button>
                </div>
                </>
            )}

        </form>
    </div>
    )
}

export default Register;