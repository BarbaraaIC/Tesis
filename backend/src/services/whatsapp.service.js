"use strict";
import { armarDatos } from "./email.service.js";
import { registrarMensaje, motivoLegible } from "./whatsappMen.service.js";

function configuracion() {
    return {
        apiVersion: process.env.WA_API_VERSION || "v25.0",
        token: process.env.WA_TOKEN,
        phoneNumberId: process.env.WA_PHONE_NUMBER_ID,
        bannerUrl: process.env.WA_BANNER_URL || null,
        botonDinamico: process.env.WA_BOTON_DINAMICO === "true",
        plantillaConfirmacion: process.env.WA_TPL_CONFIRMACION || "confirmacion_reserva",
        plantillaRecordatorio: process.env.WA_TPL_RECORDATORIO || "recordatorio_reserva",
        plantillaCancelacion: process.env.WA_TPL_CANCELACION || "cancelar_reserva",
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


function limpiar(texto) {
    const limpio = String(texto ?? "")
        .replace(/[\n\r\t]+/g, " ")
        .replace(/ {2,}/g, " ")
        .trim();
    return limpio || "-";
}

async function enviarPlantilla({ to, plantilla, variables, botonParam, cod_reserva, tipo, conBanner = true, guardarRegistro = true }) {
    const cfg = configuracion();
    const telefono = normalizarTelefono(to);
    const registrar = async (datos) => {
        if (guardarRegistro) {
            await registrarMensaje({ cod_reserva, tipo, telefono, ...datos });
        }
    };

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

    if (conBanner && cfg.bannerUrl) {
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

        await registrar({ estado: "enviado", wamid: datos.messages?.[0]?.id ?? null });
        return true;
    } catch (error) {
        console.error("No se pudo enviar el WhatsApp a", telefono, "-", error.message);
        await registrar({ estado: "fallido", error_mensaje: "No se pudo conectar con WhatsApp." });
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

async function enviarPlantillaDeReserva(reserva, plantilla, tipo, { conBanner = true, conBoton = true, guardarRegistro = true, sinNombre = false } = {}) {
    let datos;
    try {
        datos = variablesReserva(reserva);
    } catch (error) {
        console.error("WhatsApp: faltan datos de la reserva", reserva?.cod_reserva, "-", error.message);
        if (guardarRegistro) {
            await registrarMensaje({
                cod_reserva: reserva?.cod_reserva,
                tipo,
                telefono: "",
                estado: "fallido",
                error_mensaje: "Faltan datos de la reserva para armar el mensaje.",
            });
        }
        return false;
    }

    return enviarPlantilla({
        to: datos.telefono,
        plantilla,
        variables: sinNombre ? datos.variables.slice(1) : datos.variables,
        botonParam: conBoton ? reserva.cod_reserva : null,
        cod_reserva: reserva.cod_reserva,
        tipo,
        conBanner,
        guardarRegistro,
    });
}

export async function enviarConfirmacionReservaWhatsApp(reserva) {
    return enviarPlantillaDeReserva(reserva, configuracion().plantillaConfirmacion, "confirmacion");
}

export async function enviarRecordatorioReservaWhatsApp(reserva) {
    return enviarPlantillaDeReserva(reserva, configuracion().plantillaRecordatorio, "recordatorio");
}

export async function enviarCancelacionReservaWhatsApp(reserva) {
    return enviarPlantillaDeReserva(reserva, configuracion().plantillaCancelacion, "cancelacion", {
        conBanner: false,
        conBoton: false,
        guardarRegistro: false,
        sinNombre: true,
    });
}