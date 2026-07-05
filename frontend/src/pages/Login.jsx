import { useState } from "react";
import {Link, useNavigate} from 'react-router-dom';

function Login (){
    const [correo, setCorreo] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate ()

    const handleSubmit = async (event) => {
        event.preventDefault();
            setError('');

try {
        const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
        })

        const data = await res.json()

            if (!res.ok) {
                setError(data.message || 'Error al iniciar sesión, la contraseña o el correo no es el correcto.')
                return
            }

            localStorage.setItem('token', data.data.token)
            localStorage.setItem('usuario', JSON.stringify(data.data.user || {}))
            //localStorage.setItem('usuario', JSON.stringify(data.data.usuario || {}))
        navigate('/kinex-center')
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

        <p className="text-sm text-center mt-4 text-gray-600">
            ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-[#505FB6] hover:underline">Registrate</Link>
        </p>
        </form>
    </div>
    )
}

export default Login;


