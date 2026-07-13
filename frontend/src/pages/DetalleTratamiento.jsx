// DetalleTratamiento.jsx
function DetalleTratamiento({ info, alCerrar, alReservar }) {
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col justify-between">
            <nav className="flex items-center justify-between px-6 py-4 bg-[#04B6B6] text-white shadow-sm">
                <span className="font-bold text-xl">KinexCenter</span>
                <button onClick={alCerrar} className="text-sm underline cursor-pointer">
                    ← Volver al Inicio
                </button>
            </nav>

            <main className="max-w-2xl mx-auto px-6 py-16 flex-1 w-full flex items-center">
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 w-full">
                    <span className="text-[#505FB6] font-semibold text-xs tracking-widest block mb-1 uppercase">
                        Servicio Clínico
                    </span>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{info.name}</h1>
                    <p className="text-gray-600 text-base leading-relaxed mb-8">{info.description}</p>

                    <div className="flex gap-4 justify-end border-t border-gray-100 pt-4">
                        <button onClick={alCerrar} className="border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer">
                            Ver otros
                        </button>
                        <button onClick={alReservar} className="bg-[#505FB6] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#404fa0] cursor-pointer">
                            Reservar Hora
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DetalleTratamiento;