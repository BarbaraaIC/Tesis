import { useState } from "react";
import { Link } from "react-router-dom";
import { solicitarRecuperacion } from "../services/auth.services.jsx";

function RecuperarPassword() {
    const [correo, setCorreo] = useState('')
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [enviando, setEnviando] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError('')
        setMensaje('')
        setEnviando(true)
        try {
            const data = await solicitarRecuperacion(correo)
            setMensaje(data.message)
        } catch (err) {
            setError(err.message)
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#04B6B6] px-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">¿Olvidaste tu contraseña?</h2>
                <p className="text-sm text-gray-600 text-center mb-6">
                    Escribe tu correo y te enviaremos un enlace para elegir una nueva.
                </p>

                {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
                {mensaje && <p className="text-green-700 text-sm mb-4 text-center">{mensaje}</p>}

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                    <input
                        type="email"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04B6B6]"
                    />
                </div>

                <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-[#04B6B6] text-white py-2 rounded-lg font-medium hover:bg-[#3f4d9e] transition-colors cursor-pointer disabled:opacity-50"
                >{enviando ? 'Enviando...' : 'Enviar enlace'}
                </button>

                <p className="text-sm text-center mt-4 text-gray-600">
                    <Link to="/login" className="text-[#505FB6] hover:underline">Volver a iniciar sesión</Link>
                </p>
            </form>
        </div>
    )
}

export default RecuperarPassword;