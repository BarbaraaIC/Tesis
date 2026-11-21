const zona_horaria = 'America/Santiago'

const textos_tipo = {
  confirmacion: 'Confirmación',
  recordatorio: 'Recordatorio',
}

const estados = {
  enviado: {
    simbolo: '✓',
    clase: 'border-gray-200 bg-gray-50 text-gray-500',
    detalle: () => 'Enviado a WhatsApp, todavía no llega al teléfono del paciente',
  },
  entregado: {
    simbolo: '✓✓',
    clase: 'border-gray-200 bg-gray-50 text-gray-600',
    detalle: (mensaje) => 'Entregado el ' + formatearMomento(mensaje.entregado_en || mensaje.creado_en),
  },
  leido: {
    simbolo: '✓✓',
    clase: 'border-sky-200 bg-sky-50 text-sky-600',
    detalle: (mensaje) => 'Leído el ' + formatearMomento(mensaje.leido_en || mensaje.entregado_en || mensaje.creado_en),
  },
  fallido: {
    simbolo: '✗',
    clase: 'border-red-200 bg-red-50 text-red-600',
    detalle: (mensaje) => mensaje.error_mensaje || 'No se pudo enviar el mensaje',
  },
}

function formatearMomento(valor) {
  if (!valor) {
    return ''
  }
  return new Date(valor).toLocaleString('es-CL', {
    timeZone: zona_horaria,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// La lista llega ordenada del más nuevo al más antiguo: se deja el último mensaje de cada tipo.
// eslint-disable-next-line react-refresh/only-export-components
export function ultimosMensajesPorTipo(mensajes) {
  const porTipo = {}
  ;(mensajes || []).forEach((mensaje) => {
    if (!porTipo[mensaje.tipo]) {
      porTipo[mensaje.tipo] = mensaje
    }
  })
  return Object.values(porTipo)
}

// eslint-disable-next-line react-refresh/only-export-components
export function tieneFalloWhatsApp(reserva) {
  return ultimosMensajesPorTipo(reserva.mensajesWhatsapp).some((mensaje) => mensaje.estado === 'fallido')
}

const EstadoWhatsApp = ({ mensajes }) => {
  const ultimos = ultimosMensajesPorTipo(mensajes)

  if (ultimos.length === 0) {
    return null
  }

  const fallidos = ultimos.filter((mensaje) => mensaje.estado === 'fallido' && mensaje.error_mensaje)

  return (
    <span className="flex flex-col gap-1 sm:w-[220px] shrink-0">
      <span className="flex flex-wrap gap-1">
        {ultimos.map((mensaje) => {
          const estado = estados[mensaje.estado] || estados.enviado
          const nombreTipo = textos_tipo[mensaje.tipo] || mensaje.tipo
          const detalle = nombreTipo + ' por WhatsApp: ' + estado.detalle(mensaje)

          return (
            <span
              key={mensaje.id_mensaje}
              title={detalle}
              aria-label={detalle}
              className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ' + estado.clase}
            >
              <span aria-hidden="true">{estado.simbolo}</span>
              {nombreTipo}
            </span>
          )
        })}
      </span>

      {fallidos.map((mensaje) => (
        <span key={'motivo-' + mensaje.id_mensaje} className="text-xs text-red-600">
          {(textos_tipo[mensaje.tipo] || mensaje.tipo) + ': ' + mensaje.error_mensaje}
        </span>
      ))}
    </span>
  )
}

export default EstadoWhatsApp