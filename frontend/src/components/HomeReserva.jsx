import { useState } from 'react'
import Reservas from '../pages/Reservas'

export default function HomeReservationCTA() {
    const [paso, setPaso] = useState('idle')

    const abrirConfirmacion = () => setPaso('confirm')
    const cancelar = () => setPaso('idle')
    const aceptar = () => setPaso('form')
    const cerrarFormulario = () => setPaso('idle')

    return (
        <>
        <button
            onClick={abrirConfirmacion}
            className="px-6 py-3 rounded-lg bg-[#505FB6] text-white font-medium hover:bg-[#3f4d9e] transition-colors"
        >
            Reservar hora
        </button>
        {paso === 'confirm' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                ¿Quieres agendar una hora?
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                Elige profesional, servicio y tratamiento. Al final te pediremos
                tus datos para confirmar la reserva.
                </p>
                <div className="flex justify-end gap-2">
                <button
                    onClick={cancelar}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-sm font-medium"
                >
                    Cancelar
                </button>
                <button
                    onClick={aceptar}
                    className="px-4 py-2 rounded-lg bg-[#505FB6] text-white text-sm font-medium hover:bg-[#3f4d9e]"
                >
                    Aceptar
                </button>
                </div>
            </div>
            </div>
        )}
        {paso === 'form' && (
            <div className="fixed inset-0 z-50 bg-black/40 px-4 overflow-y-auto py-8">
            <div className="relative max-w-4xl mx-auto">
                <button
                onClick={cerrarFormulario}
                aria-label="Cerrar"
                className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-gray-800"
                >
                ✕
                </button>
                <Reservas />
            </div>
            </div>
        )}
        </>
    )
}