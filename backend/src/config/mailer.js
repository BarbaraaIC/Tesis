"use strict";

const BREVO_URL = "https://api.brevo.com/v3";

function aDestinatarios(valor) {
    if (!valor) return [];
    const lista = Array.isArray(valor) ? valor : String(valor).split(",");
    return lista
        .map((item) => {
            if (typeof item === "object" && item.address) {
                return { email: item.address, ...(item.name && { name: item.name }) };
            }
            const texto = String(item).trim();
            const m = texto.match(/^(.*)<(.+)>$/);
            if (m) {
                const name = m[1].trim().replace(/^"|"$/g, "");
                return { email: m[2].trim(), ...(name && { name }) };
            }
            return { email: texto };
        })
        .filter((d) => d.email);
}

export const transporter = {
    async sendMail({ to, subject, html, text, replyTo }) {
        const destinatarios = aDestinatarios(to);
        if (destinatarios.length === 0) {
            throw new Error("Correo sin destinatario válido");
        }

        const res = await fetch(`${BREVO_URL}/smtp/email`, {
            method: "POST",
            headers: {
                "api-key": process.env.BREVO_API_KEY,
                "content-type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify({
                sender: { name: "KinexCenter", email: process.env.MAIL_FROM },
                to: destinatarios,
                subject,
                ...(html && { htmlContent: html }),
                ...(!html && text && { textContent: text }),
                ...(replyTo && { replyTo: aDestinatarios(replyTo)[0] }),
            }),
        });

        const cuerpo = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(`Brevo ${res.status}: ${cuerpo.message || "error al enviar"}`);
        }
        return { messageId: cuerpo.messageId };
    },
};

export async function verificarCorreo() {
    try {
        if (!process.env.BREVO_API_KEY || !process.env.MAIL_FROM) {
            throw new Error("faltan BREVO_API_KEY o MAIL_FROM");
        }
        const res = await fetch(`${BREVO_URL}/account`, {
            headers: { "api-key": process.env.BREVO_API_KEY, accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Brevo respondió ${res.status}`);
        console.log("Servicio de correo listo.");
        return true;
    } catch (error) {
        console.error("No se pudo conectar al servicio de correo:", error.message);
        return false;
    }
}