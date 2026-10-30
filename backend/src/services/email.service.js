"use strict";
import fs from "fs";
import { fileURLToPath } from "url";
import { transporter } from "../config/mailer.js";

const RUTA_LOGO = fileURLToPath(new URL("../assets/logoKinexCenter.png", import.meta.url));
const HAY_LOGO = fs.existsSync(RUTA_LOGO);
const CID_LOGO = "logoKinexCenter"; 

const TITULO_CORREO = "KinexCenter";
const SUBTITULO_CORREO = "Kinesiología y Bienestar Integral";


function escaparHtml(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


function formatearDia(dia) {
    const [anio, mes, diaMes] = dia.toISOString().slice(0, 10).split("-").map(Number);
    const fecha = new Date(anio, mes - 1, diaMes);
    return fecha.toLocaleDateString("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}


function formatearHora(hora) {
    return hora.toISOString().slice(11, 16);
}

function armarDatos(reserva) {
    const asignacion = reserva.asignacion;
    return {
        paciente: asignacion.usuario,
        profesional: asignacion.profesional,
        tratamiento: asignacion.tratamiento?.descripcion ?? "",
        fecha: formatearDia(reserva.dia),
        hora: formatearHora(reserva.hora),
    };
}

function plantillaHtml(titulo, lineas) {
    const parrafos = lineas
        .map((linea) => `<p style="margin:0 0 12px;color:#1f2937;font-size:15px;line-height:1.5">${linea}</p>`)
        .join("");
    const celdaLogo = HAY_LOGO
        ? `<td style="padding-right:12px;vertical-align:middle">
        <img src="cid:${CID_LOGO}" alt="" height="40" style="display:block;height:40px;width:auto;border:0">
        </td>`
        : "";

    const subtitulo = SUBTITULO_CORREO
        ? `<br><span style="font-size:12px;color:#042f2f">${SUBTITULO_CORREO}</span>`
        : "";

    const encabezado = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
        ${celdaLogo}
        <td style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif">
            <span style="font-size:20px;font-weight:bold;color:#042f2f">${TITULO_CORREO}</span>${subtitulo}
        </td>
    </tr>
    </table>`;

    return `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="background:#04B6B6;padding:16px 24px">
        ${encabezado}
    </div>
<div style="padding:24px">
    <h2 style="margin:0 0 16px;font-size:18px;color:#111827">${titulo}</h2>
    ${parrafos}
</div>
<div style="padding:12px 24px;background:#f9fafb;color:#6b7280;font-size:12px">
    Este es un mensaje automático, por favor no respondas a este correo.
</div>
</div>`;
}

export async function enviarCorreo({ to, subject, text, html }) {
    if (!to) {
        return false;
    }

    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM || process.env.SMTP_USER,
            to,
            subject,
            text,
            html,
            attachments: HAY_LOGO
                ? [{ filename: "logoKinexCenter.png", path: RUTA_LOGO, cid: CID_LOGO }]
                : [],
        });
        return true;
    } catch (error) {
        console.error("No se pudo enviar el correo a", to, "-", error.message);
        return false;
    }
}

export async function enviarConfirmacionReserva(reserva) {
    const d = armarDatos(reserva);
    const nombrePaciente = `${d.paciente.nombre} ${d.paciente.apellido}`;
    const nombreProfesional = `${d.profesional.nombre} ${d.profesional.apellido}`;

    const alPaciente = enviarCorreo({
        to: d.paciente.correo,
        subject: "Tu hora fue reservada",
        text: `Hola ${d.paciente.nombre}, tu hora de ${d.tratamiento} con ${nombreProfesional} quedó reservada para el ${d.fecha} a las ${d.hora}.`,
        html: plantillaHtml("Tu hora fue reservada", [
            `Hola ${escaparHtml(d.paciente.nombre)},`,
            `Tu hora de <strong>${escaparHtml(d.tratamiento)}</strong> con ${escaparHtml(nombreProfesional)} quedó reservada.`,
            `<strong>Fecha:</strong> ${escaparHtml(d.fecha)}<br><strong>Hora:</strong> ${escaparHtml(d.hora)}`,
            `Si no puedes asistir, cancela tu hora desde la plataforma con <strong>3 horas de anticipación</strong>.`,
        ]),
    });

    const alProfesional = enviarCorreo({
        to: d.profesional.correo,
        subject: "Nueva hora reservada",
        text: `${nombrePaciente} reservó ${d.tratamiento} para el ${d.fecha} a las ${d.hora}.`,
        html: plantillaHtml("Nueva hora reservada", [
            `${escaparHtml(nombrePaciente)} reservó <strong>${escaparHtml(d.tratamiento)}</strong>.`,
            `<strong>Fecha:</strong> ${escaparHtml(d.fecha)}<br><strong>Hora:</strong> ${escaparHtml(d.hora)}`,
        ]),
    });

    await Promise.all([alPaciente, alProfesional]);
}

// recordatorio para paciente
export async function enviarRecordatorioReserva(reserva) {
    const d = armarDatos(reserva);
    const nombreProfesional = `${d.profesional.nombre} ${d.profesional.apellido}`;

    return enviarCorreo({
        to: d.paciente.correo,
        subject: "Recordatorio: tienes una hora mañana",
        text: `Hola ${d.paciente.nombre}, te recordamos tu hora de ${d.tratamiento} con ${nombreProfesional} el ${d.fecha} a las ${d.hora}.`,
        html: plantillaHtml("Recordatorio de tu hora", [
            `Hola ${escaparHtml(d.paciente.nombre)},`,
            `Te recordamos tu hora de <strong>${escaparHtml(d.tratamiento)}</strong> con ${escaparHtml(nombreProfesional)}.`,
            `<strong>Fecha:</strong> ${escaparHtml(d.fecha)}<br><strong>Hora:</strong> ${escaparHtml(d.hora)}`,
            `Si no puedes asistir, cancela tu hora desde la plataforma con <strong>3 horas de anticipación</strong>.`,
        ]),
    });
}

export async function enviarCancelacionReserva(reserva) {
    const d = armarDatos(reserva);
    const nombrePaciente = `${d.paciente.nombre} ${d.paciente.apellido}`;
    const nombreProfesional = `${d.profesional.nombre} ${d.profesional.apellido}`;
 
    const alPaciente = enviarCorreo({
        to: d.paciente.correo,
        subject: "Tu hora fue cancelada",
        text: `Hola ${d.paciente.nombre}, tu hora de ${d.tratamiento} con ${nombreProfesional} del ${d.fecha} a las ${d.hora} fue cancelada.`,
        html: plantillaHtml("Tu hora fue cancelada", [
            `Hola ${escaparHtml(d.paciente.nombre)},`,
            `Tu hora de <strong>${escaparHtml(d.tratamiento)}</strong> con ${escaparHtml(nombreProfesional)} fue cancelada.`,
            `<strong>Fecha:</strong> ${escaparHtml(d.fecha)}<br><strong>Hora:</strong> ${escaparHtml(d.hora)}`,
            "Si lo necesitas, puedes reservar una nueva hora desde la plataforma.",
        ]),
    });
 
    const alProfesional = enviarCorreo({
        to: d.profesional.correo,
        subject: "Hora cancelada",
        text: `La hora de ${d.tratamiento} con ${nombrePaciente} del ${d.fecha} a las ${d.hora} fue cancelada.`,
        html: plantillaHtml("Hora cancelada", [
            `La hora de <strong>${escaparHtml(d.tratamiento)}</strong> con ${escaparHtml(nombrePaciente)} fue cancelada.`,
            `<strong>Fecha:</strong> ${escaparHtml(d.fecha)}<br><strong>Hora:</strong> ${escaparHtml(d.hora)}`,
        ]),
    });
 
    await Promise.all([alPaciente, alProfesional]);
}