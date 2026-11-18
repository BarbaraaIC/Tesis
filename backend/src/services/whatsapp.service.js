"use strict";
import { armarDatos } from "./email.service.js";


const API_VERSION = process.env.WA_API_VERSION || "v25.0";
const TOKEN = process.env.WA_TOKEN;
const PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const PLANTILLA_CONFIRMACION = process.env.WA_TPL_CONFIRMACION || "reserva_confirmada";
const PLANTILLA_RECORDATORIO = process.env.WA_TPL_RECORDATORIO || "recordatorio_reserva";
const IDIOMA = process.env.WA_IDIOMA || "es_CL";

function normalizarTelefono(telefono) {
    let digitos = String(telefono ?? "").replace(/\D/g, "");
    if (digitos.length === 9 && digitos.startsWith("9")) {
        digitos = "56" + digitos;
    }
    return digitos;
}
function limpiar(texto) {
    const limpio = String(texto ?? "")
        .replace(/[\n\r\t]+/g, " ")
        .replace(/ {2,}/g, " ")
        .trim();
    return limpio || "-";
}

async function enviarPlantilla({ to, plantilla, variables, botonParam }) {
    const telefono = normalizarTelefono(to);
    if (!telefono) {
        return false; // paciente sin teléfono: no se envía, igual que enviarCorreo sin correo
    }
    if (!TOKEN || !PHONE_NUMBER_ID) {
        console.error("WhatsApp: faltan WA_TOKEN o WA_PHONE_NUMBER_ID");
        return false;
    }

    const components = [];

    if (BANNER_URL) {
        components.push({
            type: "header",
            parameters: [{ type: "image", image: { link: BANNER_URL } }],
        });
    }

    components.push({
        type: "body",
        parameters: variables.map((valor) => ({ type: "text", text: limpiar(valor) })),
    });

    if (BOTON_DINAMICO && botonParam) {
        components.push({
            type: "button",
            sub_type: "url",
            index: "0",
            parameters: [{ type: "text", text: String(botonParam) }],
        });
    }

    try {
        const respuesta = await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: telefono,
                type: "template",
                template: { name: plantilla, language: { code: IDIOMA }, components },
            }),
        });

        const datos = await respuesta.json();
        if (!respuesta.ok) {
            const e = datos.error ?? {};
            console.error(
                `No se pudo enviar el WhatsApp a ${telefono} - [${e.code ?? respuesta.status}] ${e.message ?? ""} ${e.error_data?.details ?? ""}`
            );
            return false;
        }
        return true;
    } catch (error) {
        console.error("No se pudo enviar el WhatsApp a", telefono, "-", error.message);
        return false;
    }
}

function variablesReserva(reserva) {
    const d = armarDatos(reserva);
    return {
        telefono: d.paciente.telefono, 
        variables: [
            d.paciente.nombre,
            d.tratamiento,
            `${d.profesional.nombre} ${d.profesional.apellido}`,
            d.fecha,
            d.hora,
        ],
    };
}

export async function enviarConfirmacionReservaWhatsApp(reserva) {
    const { telefono, variables } = variablesReserva(reserva);
    return enviarPlantilla({
        to: telefono,
        plantilla: PLANTILLA_CONFIRMACION,
        variables,
        botonParam: reserva.cod_reserva,
    });
}

export async function enviarRecordatorioReservaWhatsApp(reserva) {
    const { telefono, variables } = variablesReserva(reserva);
    return enviarPlantilla({
        to: telefono,
        plantilla: PLANTILLA_RECORDATORIO,
        variables,
        botonParam: reserva.cod_reserva,
    });
}
