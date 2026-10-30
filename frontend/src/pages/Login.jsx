import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from "@react-oauth/google";
import { guardarSesion } from "../services/sesion.service.js";

function Login (){
    const [correo, setCorreo] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate ()

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.message || 'Error al iniciar sesión, la contraseña o el correo no es el correcto.')
                return
            }

            navigate(guardarSesion(data.data))
        } catch {
            setError('Error de conexión con el servidor')
        }
    }

    const handleGoogle = async ({ credential }) => {
        setError('')
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential }),
            })

            const json = await res.json()

            if (!res.ok) {
                setError(json.message || 'No se pudo iniciar sesión con Google.')
                return
            }

            // Cuenta nueva: se manda al registro con los datos de Google precargados
            if (json.data?.registroPendiente) {
                navigate('/register', { state: { credential, ...json.data } })
                return
            }

            navigate(guardarSesion(json.data))
        } catch {
            setError('Error de conexión con el servidor')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#04B6B6] px-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">¡Bienvenida/o a KinexCenter!</h2>

                {error && (
                    <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
                )}

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                    <input
                        type="email"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#04B6B6]"
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

                <button
                    type="submit"
                    className="w-full bg-[#04B6B6] text-white py-2 rounded-lg font-medium hover:bg-[#3f4d9e] transition-colors cursor-pointer"
                >Entrar
                </button>

                <div className="flex items-center gap-3 my-5">
                    <span className="flex-1 h-px bg-gray-300" />
                    <span className="text-xs text-gray-500">o</span>
                    <span className="flex-1 h-px bg-gray-300" />
                </div>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogle}
                        onError={() => setError('No se pudo iniciar sesión con Google.')}
                    />
                </div>

                <p className="text-sm text-center mt-4 text-gray-600">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-[#505FB6] hover:underline">Registrate</Link>
                </p>
            </form>
        </div>
    )
}

export default Login;