"use strict";
import { prisma } from "../config/configDb.js";
import { handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";

const buscarUsuarioConRol = (correo) =>
    prisma.usuario.findUnique({
        where: { correo },
        select: {
            id_usuario: true,
            rol: { select: { nombre: true } },
        },
    });

export async function isAdmin(req, res, next) {
    try {
        if (!req.usuario?.correo) {
            return handleErrorClient(res, 401, "Usuario no autenticado.");
        }

        const userFound = await buscarUsuarioConRol(req.usuario.correo);

        if (!userFound) {
            return handleErrorClient(res, 404, "Usuario no encontrado.");
        }

        if (userFound.rol.nombre !== "administrador") {
            return handleErrorClient(res, 401, "Se requiere rol de Administrador para realizar esta acción.");
        }

        next();
    } catch (error) {
        return handleErrorServer(res, 500, "Error interno del servidor.", error.message);
    }
}

export async function isAdminOrProfesional(req, res, next) {
    try {
        if (!req.usuario?.correo) {
            return handleErrorClient(res, 401, "Usuario no autenticado.");
        }

        const userFound = await buscarUsuarioConRol(req.usuario.correo);

        if (!userFound) {
            return handleErrorClient(res, 404, "Usuario no encontrado");
        }

        const nombreRol = userFound.rol.nombre;
        if (nombreRol !== "administrador" && nombreRol !== "profesional") {
            return handleErrorClient(res, 401, "Se requiere rol de administrador o profesional para realizar esta acción.");
        }

        next();
    } catch (error) {
        return handleErrorServer(res, 500, "Error interno del servidor", error.message);
    }
}

export async function isProfesional(req, res, next) {
    try {
        if (!req.usuario?.correo) {
            return handleErrorClient(res, 401, "Usuario no autenticado.");
        }

        const userFound = await buscarUsuarioConRol(req.usuario.correo);

        if (!userFound) {
            return handleErrorClient(res, 404, "Usuario no encontrado");
        }

        if (userFound.rol.nombre !== "profesional") {
            return handleErrorClient(res, 401, "Se requiere rol de profesional para acceder.");
        }

        next();
    } catch (error) {
        return handleErrorServer(res, 500, "Error interno del servidor", error.message);
    }
}