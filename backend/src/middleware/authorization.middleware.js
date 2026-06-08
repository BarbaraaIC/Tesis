"use strict";
import { prisma } from "../config/configDb.js";

export async function isAdmin(req, res, next) {
    try {
        if (!req.usuario.correo) {
            return res.status(401).json({ message: "Usuario no autenticado." });
        }

        const userFound = await prisma.usuario.findUnique({
            where: { correo: req.user.correo },
        });

        if (!userFound) return res.status(404).json({ message: "Usuario no encontrado" });

        if (userFound.rol !== "administrador") {
            return res.status(401).json({
                message: "Se requiere rol de Administrador para realizar esta acción.",
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
}

export async function isProfesional(req, res, next) {
    try {
        if (!req.usuario.correo) {
            return res.status(401).json({ message: "Usuario no autenticado." });
        }

        const usuarioBusqueda = await prisma.usuario.findUnique({
            where: { correo: req.user.correo },
        });

        if (!usuarioBusqueda) return res.status(404).json({ message: "Usuario no encontrado" });

        if (usuarioBusqueda.rol !== "profesional") {
            return res.status(401).json({
                message: "Se requiere rol de profesional para acceder a este recurso.",
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
}
