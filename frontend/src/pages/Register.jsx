import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register (){
    const navigate = useNavigate()
    const [step, setStep] = useState(1)
    const [error, setError] = useState('')
    const [nombre, setNombre] = useState('')
    const [apellido, setApellido] = useState('')
    const [rut, setRut] = useState('')
    const [correo, setCorreo] = useState('')
    const [telefono, setTelefono] = useState('')
    const [password, setPassword] = useState('')
    const [edad, setEdad] = useState('')
    const [ocupacion, setOcupacion] = useState('')
    const [direccion, setDireccion] = useState('')
    const [tieneEnfermedades, setTieneEnfermedades] = useState('no')
    const [enfermedades, setEnfermedades] = useState('')
    const [tieneMedicamentos, setTieneMedicamentos] = useState('no')
    const [medicamentos, setMedicamentos] = useState('')

    const handleSubmit = async (event) => {
        event.preventDefault();
            setError('');

try {
        const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nombre, apellido, rut, correo, telefono, password, edad, ocupacion, direccion,
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
                            min="1" max="110"
                            value={edad}
                            onChange={(e) => setEdad(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#505FB6]"
                        />
                </div>

                <button type="button" onClick={() => setStep(2)} className="w-full bg-[#04B6B6] text-white py-2 rounded-lg font-medium hover:bg-[#3f4d9e] transition-colors cursor-pointer">
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
                    <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors cursor-pointer">
                        Anterior
                    </button>
                    <button type="button" onClick={() => setStep(3)} className="flex-1 bg-[#505FB6] text-white py-2 rounded-lg font-medium hover:bg-[#3f4d9e] transition-colors cursor-pointer">
                        Siguiente
                    </button>
                </div>
                </>
            )}
            {step === 3 && (
                <>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ocupación</label>
                        <input
                            type="text"
                            value={ocupacion}
                            onChange={(e) => setOcupacion(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#505FB6]"
                        />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">¿Tiene alguna enfermedad?</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">¿Toma algún medicamento?</label>
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
                    <button type="button" onClick={() => setStep(2)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors cursor-pointer">
                        Anterior
                    </button>
                    <button type="submit" className="flex-1 bg-[#505FB6] text-white py-2 rounded-lg font-medium hover:bg-[#3f4d9e] transition-colors cursor-pointer">
                        Registrar
                    </button>
                </div>
                </>
            )}

        </form>
    </div>
    )
}

export default Register;
