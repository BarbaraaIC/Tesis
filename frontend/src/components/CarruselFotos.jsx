import { useEffect, useState } from 'react'

function CarruselFotos({ fotos }) {
    const [fotoActual, setFotoActual] = useState(0)

    const irASiguiente = () => setFotoActual((actual) => (actual + 1) % fotos.length)
    const irAAnterior = () => setFotoActual((actual) => (actual - 1 + fotos.length) % fotos.length)

  // Cambia de foto sola cada 5 segundos
    useEffect(() => {
        if (fotos.length < 2) return

    const temporizador = setInterval(irASiguiente, 5000)
    return () => clearInterval(temporizador)
  // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fotos.length, fotoActual])

    return (
        <div className="relative w-full overflow-hidden rounded-xl shadow-sm">
        <div
        className="flex transition-transform duration-500"
        style={{ transform: `translateX(-${fotoActual * 100}%)` }}
        >
        {fotos.map((foto) => (
            <img
            key={foto.src}
            src={foto.src}
            alt={foto.alt}
            className="w-full shrink-0 h-64 md:h-80 object-cover"
            />
        ))}
        </div>

        {fotos.length > 1 && (
        <>
            <button
            type="button"
            onClick={irAAnterior}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 text-gray-800 hover:bg-white cursor-pointer"
            >
                ‹
            </button>

            <button
            type="button"
            onClick={irASiguiente}
            aria-label="Foto siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 text-gray-800 hover:bg-white cursor-pointer"
            >
                ›
            </button>

          {/* Puntos: uno por foto, el actual va más largo */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {fotos.map((foto, posicion) => (
              <button
                type="button"
                key={foto.src}
                onClick={() => setFotoActual(posicion)}
                aria-label={`Ir a la foto ${posicion + 1}`}
                className={`h-2 rounded-full cursor-pointer ${
                  posicion === fotoActual ? 'w-5 bg-white' : 'w-2 bg-white/60'
                }`}
              />
            ))}
        </div>
        </>
    )}
    </div>
    )
}

export default CarruselFotos