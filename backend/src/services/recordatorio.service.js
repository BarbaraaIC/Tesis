"use strict";
import cron from "node-cron";
import { prisma } from "../config/configDb.js";
import { enviarRecordatorioReserva } from "./email.service.js";

const ZONA = "America/Santiago";

function diaDeManana() {
    const hoyChile = new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(new Date()); // YYYY-MM-DD
    const manana = new Date(hoyChile);
    manana.setUTCDate(manana.getUTCDate() + 1);
    return manana;
}

export async function enviarRecordatoriosDeManana() {
    try {
        const reservas = await prisma.reserva.findMany({
            where: {
                dia: diaDeManana(),
                recordatorio_enviado: false,
            },
            include: {
                asignacion: {
                    include: {
                        usuario: { select: { nombre: true, apellido: true, correo: true } },
                        profesional: { select: { nombre: true, apellido: true, correo: true } },
                        tratamiento: true,
                    },
                },
            },
        });

        for (const reserva of reservas) {
            const enviado = await enviarRecordatorioReserva(reserva);
            if (enviado) {
                await prisma.reserva.update({
                    where: { cod_reserva: reserva.cod_reserva },
                    data: { recordatorio_enviado: true },
                });
            }
        }

        console.log(`Recordatorios procesados: ${reservas.length}`);
    } catch (error) {
        console.error("Error al enviar recordatorios:", error.message);
    }
}

export function iniciarRecordatorios() {
    cron.schedule("0 17 * * *", enviarRecordatoriosDeManana, { timezone: ZONA });
    console.log("Tarea de recordatorios programada (17:00 diario).");
}