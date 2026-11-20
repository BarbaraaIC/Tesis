"use strict";
import express, { Router } from "express";
import crypto from "node:crypto";
import { actualizarEstadoPorWamid } from "../services/whatsappMen.service.js";

const router = Router();


router.get("/", (req, res) => {
    const modo = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const desafio = req.query["hub.challenge"];

    if (modo === "subscribe" && token && token === process.env.WA_VERIFY_TOKEN) {
        return res.status(200).send(desafio);
    }
    return res.sendStatus(403);
});

function firmaValida(req) {
    const secreto = process.env.WA_APP_SECRET;
    if (!secreto) {

        return process.env.NODE_ENV !== "production";
    }
    if (!Buffer.isBuffer(req.body)) {
        return false;
    }
    const recibida = Buffer.from(req.get("x-hub-signature-256") ?? "");
    const esperada = Buffer.from(
        "sha256=" + crypto.createHmac("sha256", secreto).update(req.body).digest("hex")
    );
    return recibida.length === esperada.length && crypto.timingSafeEqual(recibida, esperada);
}


router.post("/", express.raw({ type: "*/*", limit: "1mb" }), (req, res) => {
    if (!firmaValida(req)) {
        return res.sendStatus(401);
    }

    res.sendStatus(200);

    let aviso;
    try {
        aviso = JSON.parse(Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "{}");
    } catch {
        return;
    }
    if (aviso?.object !== "whatsapp_business_account") {
        return;
    }

    for (const entrada of aviso.entry ?? []) {
        for (const cambio of entrada.changes ?? []) {
            for (const st of cambio.value?.statuses ?? []) {
                actualizarEstadoPorWamid(st).catch((error) =>
                    console.error("Error al procesar el estado de WhatsApp:", error.message)
                );
            }

        }
    }
});

export default router;