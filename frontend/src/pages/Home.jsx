import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DetalleTratamiento from './DetalleTratamiento.jsx' 
import kinexCenterImg from '../assets/kinex-center.jpg'
import quienesSomosImg from '../assets/quienes-somos.jpg'
import porqueElegirnosImg from '../assets/porque-elegirnos.jpg'

const tratamientos = [
    { name: 'Masoterapia', description: 'Tratamiento terapéutico mediante masajes orientados a aliviar contracturas musculares, reducir el estrés y mejorar la circulación.' },
    { name: 'Rehabilitación Musculoesquelética', description: 'Evaluación y tratamiento enfocado en recuperar la movilidad y funcionalidad del sistema muscular y esquelético tras lesiones o cirugías.' },
    { name: 'Estética Facial', description: 'Procedimientos no invasivos diseñados para rejuvenecer, hidratar profundamente y mejorar la elasticidad de la piel del rostro.' },
    { name: 'Tratamiento Estético Facial', description: 'Terapias avanzadas personalizadas para abordar imperfecciones específicas, líneas de expresión y flacidez mediante tecnología.' },
    { name: 'Estética Corporal', description: 'Tratamientos moldeadores, reductores y reafirmantes que ayudan a mejorar la silueta y tonificar tejidos corporales.' }
]

const beneficios = [
    'Atención personalizada', 'Profesionales certificados', 'Tecnología moderna',
    'Tratamientos efectivos', 'Ambiente cómodo y seguro', 'Enfoque integral en tu bienestar',
]

const testimonios = [
    { text: '“La atención fue excelente y los resultados se notaron rápido. Me sentí en buenas manos desde el primer día.”' },
    { text: '“El equipo es muy profesional y el ambiente es muy cómodo. Recomiendo sus servicios 100%.”' },
    { text: '“Viví una experiencia de relajación completa. La reserva fue fácil y el tratamiento muy personalizado.”' },
]

function Home() {
    const navegar = useNavigate()
    
    const [tratamientoActivo, setTratamientoActivo] = useState(null)

    if (tratamientoActivo) {
        return (
            <DetalleTratamiento 
                info={tratamientoActivo} 
                alCerrar={() => setTratamientoActivo(null)} 
                alReservar={() => navegar('/login')}
            />
        )
    }

    return (
        <div>
            <nav className="flex items-center justify-between px-6 md:px-12 py-4 bg-[#04B6B6] shadow-sm">
                <span className="text-white font-bold text-xl md:text-2xl">KinexCenter</span>
                <ul className="flex items-center gap-4 md:gap-8">
                    <li><a href="#inicio" className="text-sm md:text-base text-white hover:text-white transition-colors">Inicio</a></li>
                    <li><a href="#tratamientos" className="text-sm md:text-base text-white hover:text-white transition-colors">Tratamientos</a></li>
                    <li><a href="#contacto" className="text-sm md:text-base text-white hover:text-white transition-colors">Contacto</a></li>
                    <li><Link to="/login" className="text-sm md:text-base text-white font-medium hover:text-purple-700 transition-colors">Iniciar sesión</Link></li>
                </ul>
            </nav>

            <header className="relative bg-cover bg-center" style={{ backgroundImage: `url(${kinexCenterImg})` }}>
                <div id="inicio" className="bg-black/45 flex flex-col items-center justify-center text-white px-4 py-20">
                    <h1 className="text-4xl md:text-6xl font-bold mb-2">KinexCenter</h1>
                    <p className="text-base md:text-lg mb-6 opacity-90">Kinesiología y Bienestar Integral</p>
                    <button onClick={() => navegar('/login')} className="bg-[#505FB6] text-white px-8 py-3 rounded-lg font-medium transition-colors cursor-pointer">
                        Reservar hora
                    </button>
                </div>
            </header>

            <section className="max-w-6xl mx-auto px-6 md:px-8 py-16">
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-4 text-gray-900">¿Quiénes somos?</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Somos un centro de kinesiología y estética enfocado en el bienestar integral de nuestros pacientes.
                            Ofrecemos treatments personalizados, combinando salud, rehabilitación y cuidado estético.
                        </p>
                    </div>
                    <div className="flex-1">
                        <img src={quienesSomosImg} alt="Equipo" className="w-full h-64 md:h-80 object-cover rounded-xl shadow-sm" />
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-6 md:px-8 py-16 border-t border-gray-100">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-6 text-gray-900">¿Por qué elegirnos?</h2>
                        <ul className="space-y-3">
                            {beneficios.map((beneficio) => (
                                <li key={beneficio} className="flex items-start gap-2 text-gray-700">
                                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                                    <span>{beneficio}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1">
                        <img src={porqueElegirnosImg} alt="Instalaciones" className="w-full h-64 md:h-80 object-cover rounded-xl shadow-sm" />
                    </div>
                </div>
            </section>

            <section id="tratamientos" className="bg-gray-50 py-16">
                <div className="max-w-6xl mx-auto px-6 md:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-2 text-gray-900">Nuestros Tratamientos</h2>
                    <p className="text-gray-500 mb-10">Descubre nuestros servicios especializados</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {tratamientos.map((tratamiento) => (
                            <div
                                key={tratamiento.name}
                                onClick={() => {
                                    setTratamientoActivo(tratamiento);
                                    window.scrollTo({ top: 0 }); 
                                }}
                                className="bg-white rounded-xl px-4 py-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer text-gray-800 font-medium border border-transparent hover:border-gray-200"
                            >
                                {tratamiento.name}
                            </div>
                        ))}
                    </div>
                    
                    <p className="text-[#505FB6] font-medium mt-8 cursor-pointer hover:underline inline-block">
                        Mostrar más tratamientos →
                    </p>
                </div>
            </section>

            <section className="max-w-6xl mx-auto px-6 md:px-8 py-16">
                <div className="text-center mb-10">
                    <span className="text-[#505FB6] font-semibold text-sm uppercase tracking-widest">Nuestros clientes</span>
                    <h2 className="text-3xl font-bold mt-2 text-gray-900">Experiencias que hablan por nosotros</h2>
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                    {testimonios.map((testimonio) => (
                        <div key={testimonio.text} className="flex-1 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <p className="text-gray-600 leading-relaxed">{testimonio.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <footer id="contacto" className="bg-[#04B6B6] text-black py-12">
                <div className="max-w-6xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3166.3868763123746!2d-72.36858062447705!3d-37.47519587206239!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x966bdd77ff7f1047%3A0xb29588c093d1cef9!2sKinesiolog%C3%ADa%20y%20Bienestar%20Integral%20-%20KinexCenter!5e0!3m2!1ses-419!2scl!4v1775881042376!5m2!1ses-419!2scl"
                            width="100%" height="180" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="rounded-lg"
                        />
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3">Contacto</h3>
                        <p className="text-sm mb-1"><strong>Teléfono:</strong> +56 9 1234 5678</p>
                        <p className="text-sm mb-4"><strong>Correo:</strong> info@kinexcenter.cl</p>
                        <h3 className="font-semibold mb-3">Nuestros Convenios</h3>
                        <ul className="text-sm space-y-1"><li>Fonasa</li><li>Isapre</li><li>Particular</li></ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3">Dirección</h3>
                        <p className="text-sm mb-1">Víctor Domingo Silva 317</p>
                        <p className="text-sm mb-4">Los Ángeles, Chile</p>
                        <h3 className="font-semibold mb-3">Medios de pago</h3>
                        <ul className="text-sm space-y-1"><li>Transbank</li><li>Transferencia</li><li>Efectivo</li></ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-3">Horarios de atención</h3>
                        <p className="text-sm mb-1">Lunes - Viernes: 08:00 - 20:00</p>
                        <p className="text-sm">Sábado: 08:00 - 18:00</p>
                        <p className="text-sm">Domingos: 08:00 - 20:00</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home
