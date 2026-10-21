"use strict";
import nodemailer from "nodemailer";

const puerto = Number(process.env.SMTP_PORT) || 465;

// Con el puerto 465 la conexión es segura desde el inicio (secure: true).
// Con el 587 se usa STARTTLS, y nodemailer lo negocia solo (secure: false).
export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: puerto,
    secure: puerto === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function verificarCorreo() {
    try {
        await transporter.verify();
        console.log("Servicio de correo listo.");
        return true;
    } catch (error) {
        console.error("No se pudo conectar al servicio de correo:", error.message);
        return false;
    }
}