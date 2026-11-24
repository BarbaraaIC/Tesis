import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { restablecerPassword } from "../services/auth.services.jsx";

const password_val = /^(?=.*\d)[^.,?= \s]{8,30}$/;
const mensaje_password = 'La contraseña debe tener entre 8 y 30 caracteres, al menos un número y no usar espacios ni . , ? =';

function RestablecerPassword() {
    const [params] = useSearchParams()
    const id = params.get('id')
    const token = params.get('token')
    const [nueva, setNueva] = useState('')
    const [repetida, setRepetida] = useState('')
    const [error, setError] = useState('')
    const [listo, setListo] = useState(false)
    const [guardando, setGuardando] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        if (!password_val.test(nueva)) return setError(mensaje_password)
        if (nueva !== repetida) return setError('Las contraseñas no coinciden.')

        setGuardando(true)
        try {
            await restablecerPassword({ id, token, passwordNueva: nueva })
            setListo(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setGuardando(false)
        }
    }

    const inputClase = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04B6B6]"

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#04B6B6] px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                {listo ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-3 text-gray-900">Contraseña actualizada</h2>
                        <p className="text-sm text-gray-600 mb-6">Ya puedes iniciar sesión con tu nueva contraseña.</p>
                        <Link to="/login" className="block w-full bg-[#04B6B6] text-white py-2 rounded-lg font-medium hover:bg-[#3f4d9e] transition-colors">
                            Ir a iniciar sesión
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Nueva contraseña</h2>

                        {(!id || !token) && (
                            <p className="text-red-600 text-sm mb-4 text-center">El enlace no es válido. Solicita uno nuevo.</p>
                        )}
                        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña nueva</label>
                            <input type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} required className={inputClase} autoComplete="new-password" />
                        </div>
                        <div className="mb-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Repite la contraseña</label>
                            <input type="password" value={repetida} onChange={(e) => setRepetida(e.target.value)} required className={inputClase} autoComplete="new-password" />
                        </div>
                        <p className="text-xs text-gray-500 mb-6">{mensaje_password}</p>

                        <button
                            type="submit"
                            disabled={guardando || !id || !token}
                            className="w-full bg-[#04B6B6] text-white py-2 rounded-lg font-medium hover:bg-[#3f4d9e] transition-colors cursor-pointer disabled:opacity-50"
                        >{guardando ? 'Guardando...' : 'Guardar contraseña'}
                        </button>

                        <p className="text-sm text-center mt-4 text-gray-600">
                            <Link to="/recuperar-password" className="text-[#505FB6] hover:underline">Solicitar un enlace nuevo</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}

export default RestablecerPassword;