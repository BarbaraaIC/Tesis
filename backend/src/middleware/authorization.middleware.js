"use strict";
import { prisma } from "../config/configDb.js";
import { handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

export async function isAdmin(req, res, next) {
    try {
        if (!req.usuario.correo) {
            return handleErrorClient(res, 401, "Usuario no autenticado.");
        }

        const userFound = await prisma.usuario.findUnique({
            where: { correo: req.usuario.correo },
        });

        if (!userFound)
            return handleErrorClient(res, 404, "Usuario no encontrado.");

        if (userFound.rol !== "administrador") {
            return handleErrorClient(res, 401, "Se requiere rol de Administrador para realizar esta acción.");
        }

        next();
    } catch (error) {
            return handleErrorServer(res, 500, "Error interno del servidor.", error.message);
    }
}

export async function isProfesional(req, res, next) {
    try {
        if (!req.usuario.correo) {
            return handleErrorClient(res, 401, "Usuario no autenticado.");
        }

        const usuarioBusqueda = await prisma.usuario.findUnique({
            where: { correo: req.usuario.correo },
        });

        if (!usuarioBusqueda) return handleErrorClient(res, 404, "Usuario no encontrado");

        if (usuarioBusqueda.rol !== "profesional") {
            return handleErrorClient(res, 401, "Se requiere rol de profesional para acceder.");
        }

        next();
    } catch (error) {
        return handleErrorServer(res, 500, "Error interno del servidor");
    }
}
