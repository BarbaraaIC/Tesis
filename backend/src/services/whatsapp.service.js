"use strict";
import { armarDatos } from "./email.service.js";
import { registrarMensaje, motivoLegible } from "./whatsapp.mensajes.service.js";

// ───────────── Configuración (variables de entorno del backend) ─────────────
// WA_TOKEN             token permanente del usuario del sistema
// WA_PHONE_NUMBER_ID   "Identificador de número de teléfono" (Configuración de la API)
// WA_BANNER_URL        (opcional) URL pública https de la imagen del encabezado.
//                      Solo si creaste las plantillas con encabezado de imagen.
// WA_BOTON_DINAMICO    (opcional) "true" si el botón de tus plantillas tiene una URL con {{1}}
// WA_TPL_CONFIRMACION  (opcional) nombre de la plantilla, por defecto confirmacion_reserva
// WA_TPL_RECORDATORIO  (opcional) nombre de la plantilla, por defecto recordatorio_reserva
// WA_IDIOMA            (opcional) idioma de las plantillas, por defecto es_CL
// WA_API_VERSION       (opcional) por defecto v25.0
//
// Se leen al momento de enviar (no al importar el archivo), así no dependen
// del orden en que se cargue dotenv.
function configuracion() {
    return {
        apiVersion: process.env.WA_API_VERSION || "v25.0",
        token: process.env.WA_TOKEN,
        phoneNumberId: process.env.WA_PHONE_NUMBER_ID,
        bannerUrl: process.env.WA_BANNER_URL || null,
        botonDinamico: process.env.WA_BOTON_DINAMICO === "true",
        plantillaConfirmacion: process.env.WA_TPL_CONFIRMACION || "confirmacion_reserva",
        plantillaRecordatorio: process.env.WA_TPL_RECORDATORIO || "recordatorio_reserva",
        idioma: process.env.WA_IDIOMA || "es_CL",
    };
}

// "+56 9 1234 5678", "9 1234 5678", "912345678" -> "56912345678"
function normalizarTelefono(telefono) {
    let digitos = String(telefono ?? "").replace(/\D/g, "");
    if (digitos.length === 9 && digitos.startsWith("9")) {
        digitos = "56" + digitos;
    }
    return digitos;
}

// Meta rechaza variables vacías, con saltos de línea, tabulaciones o muchos espacios seguidos.
function limpiar(texto) {
    const limpio = String(texto ?? "")
        .replace(/[\n\r\t]+/g, " ")
        .replace(/ {2,}/g, " ")
        .trim();
    return limpio || "-";
}

// Devuelve true si Meta aceptó el mensaje y false si no. Nunca lanza error.
// Además guarda cada intento en la tabla mensajes_whatsapp para poder hacerle seguimiento.
async function enviarPlantilla({ to, plantilla, variables, botonParam, cod_reserva, tipo }) {
    const cfg = configuracion();
    const telefono = normalizarTelefono(to);
    const registrar = (datos) => registrarMensaje({ cod_reserva, tipo, telefono, ...datos });

    if (!telefono) {
        await registrar({ estado: "fallido", error_mensaje: "El paciente no tiene un teléfono registrado." });
        return false; // paciente sin teléfono: no se envía, igual que enviarCorreo sin correo
    }
    if (!cfg.token || !cfg.phoneNumberId) {
        console.error("WhatsApp: faltan WA_TOKEN o WA_PHONE_NUMBER_ID");
        await registrar({ estado: "fallido", error_mensaje: "La configuración de WhatsApp está incompleta." });
        return false;
    }

    const components = [];

    if (cfg.bannerUrl) {
        components.push({
            type: "header",
            parameters: [{ type: "image", image: { link: cfg.bannerUrl } }],
        });
    }

    components.push({
        type: "body",
        parameters: variables.map((valor) => ({ type: "text", text: limpiar(valor) })),
    });

    if (cfg.botonDinamico && botonParam) {
        components.push({
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: String(botonParam) }],
        });
    }

    try {
        const respuesta = await fetch(`https://graph.facebook.com/${cfg.apiVersion}/${cfg.phoneNumberId}/messages`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${cfg.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: telefono,
                type: "template",
                template: { name: plantilla, language: { code: cfg.idioma }, components },
            }),
        });

        const datos = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) {
            const e = datos.error ?? {};
            console.error(
                `No se pudo enviar el WhatsApp a ${telefono} - [${e.code ?? respuesta.status}] ${e.message ?? ""} ${e.error_data?.details ?? ""}`
            );
            await registrar({
                estado: "fallido",
                error_codigo: Number.isInteger(e.code) ? e.code : null,
                error_mensaje: motivoLegible(e.code, e.error_data?.details ?? e.message),
            });
            return false;
        }

        // "wamid" identifica el mensaje: el webhook de Meta lo usa para avisar entregado / leído.
        await registrar({ estado: "enviado", wamid: datos.messages?.[0]?.id ?? null });
        return true;
    } catch (error) {
        console.error("No se pudo enviar el WhatsApp a", telefono, "-", error.message);
        await registrar({ estado: "fallido", error_mensaje: "No se pudo conectar con WhatsApp." });
        return false;
    }
}

// Orden de variables = orden de {{1}}..{{5}} en las plantillas:
// nombre, tratamiento, profesional, fecha, hora
function variablesReserva(reserva) {
    const d = armarDatos(reserva);
    return {
        telefono: d.paciente.telefono, // <- ajusta este nombre si tu campo se llama distinto
        variables: [
            d.paciente.nombre,
            d.tratamiento,
            `${d.profesional.nombre} ${d.profesional.apellido}`,
            d.fecha,
            d.hora,
        ],
    };
}

async function enviarPlantillaDeReserva(reserva, plantilla, tipo) {
    let datos;
    try {
        datos = variablesReserva(reserva);
    } catch (error) {
        console.error("WhatsApp: faltan datos de la reserva", reserva?.cod_reserva, "-", error.message);
        await registrarMensaje({
            cod_reserva: reserva?.cod_reserva,
            tipo,
            telefono: "",
            estado: "fallido",
            error_mensaje: "Faltan datos de la reserva para armar el mensaje.",
        });
        return false;
    }

    return enviarPlantilla({
        to: datos.telefono,
        plantilla,
        variables: datos.variables,
        botonParam: reserva.cod_reserva,
        cod_reserva: reserva.cod_reserva,
        tipo,
    });
}

export async function enviarConfirmacionReservaWhatsApp(reserva) {
    return enviarPlantillaDeReserva(reserva, configuracion().plantillaConfirmacion, "confirmacion");
}

export async function enviarRecordatorioReservaWhatsApp(reserva) {
    return enviarPlantillaDeReserva(reserva, configuracion().plantillaRecordatorio, "recordatorio");
}