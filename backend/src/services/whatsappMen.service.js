"use strict";
import { prisma } from "../config/configDb.js";

const orden = { enviado: 1, entregado: 2, leido: 3 };
const estados = { sent: "enviado", delivered: "entregado", read: "leido" };

const motivos = {
    190: "El token de acceso de WhatsApp no es válido o venció.",
    130429: "Se alcanzó el límite de envío de WhatsApp. Se podrá enviar más tarde.",
    131026: "El número no tiene WhatsApp o no pudo recibir el mensaje.",
    131030: "El número de destino no está autorizado (la cuenta está en modo de pruebas).",
    131042: "Hay un problema con el método de pago de la cuenta de WhatsApp.",
    131048: "WhatsApp limitó los envíos por posible spam.",
    131049: "WhatsApp decidió no entregar este mensaje.",
    131056: "Se enviaron demasiados mensajes seguidos a este número.",
    132000: "La plantilla no coincide con los datos enviados.",
    132001: "La plantilla de WhatsApp no existe o no está aprobada.",
    132012: "El formato de los datos de la plantilla no es válido.",
};

export function motivoLegible(codigo, mensajeOriginal) {
    if (motivos[codigo]) {
        return motivos[codigo];
    }
    return mensajeOriginal ? String(mensajeOriginal).slice(0, 300) : "No se pudo enviar el mensaje.";
}

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


export async function registrarMensaje({
    cod_reserva,
    tipo,
    telefono,
    wamid = null,
    estado,
    error_codigo = null,
    error_mensaje = null,
}) {
    try {
        return await prisma.mensajeWhatsapp.create({
            data: {
                cod_reserva,
                tipo,
                telefono: String(telefono ?? ""),
                wamid,
                estado,
                error_codigo,
                error_mensaje,
            },
        });
    } catch (error) {
        console.error("No se pudo guardar el registro del WhatsApp:", error.message);
        return null;
    }
}


export async function actualizarEstadoPorWamid(st) {
    const wamid = st?.id;
    if (!wamid) {
        return;
    }

    let existe = null;
    for (let intento = 0; intento < 5 && !existe; intento++) {
        existe = await prisma.mensajeWhatsapp.findUnique({
            where: { wamid },
            select: { id_mensaje: true },
        });
        if (!existe) {
            await esperar(1000);
        }
    }
    if (!existe) {
        console.warn("Estado de WhatsApp para un mensaje desconocido:", wamid);
        return;
    }

    const momento = st.timestamp ? new Date(Number(st.timestamp) * 1000) : new Date();

    if (st.status === "failed") {
        const e = st.errors?.[0] ?? {};
        console.error(`WhatsApp falló (${wamid}) - [${e.code}] ${e.title ?? ""} ${e.message ?? ""}`);
        await prisma.mensajeWhatsapp.updateMany({
            where: { wamid },
            data: {
                estado: "fallido",
                error_codigo: Number.isInteger(e.code) ? e.code : null,
                error_mensaje: motivoLegible(e.code, e.error_data?.details ?? e.message ?? e.title),
            },
        });
        return;
    }

    const nuevo = estados[st.status];
    if (!nuevo) {
        return;
    }

    const anteriores = Object.keys(orden).filter((estado) => orden[estado] < orden[nuevo]);
    const data = { estado: nuevo };
    if (nuevo === "entregado") {
        data.entregado_en = momento;
    }
    if (nuevo === "leido") {
        data.leido_en = momento;
    }

    await prisma.mensajeWhatsapp.updateMany({
        where: { wamid, estado: { in: anteriores } },
        data,
    });
}