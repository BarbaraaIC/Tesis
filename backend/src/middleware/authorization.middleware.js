"use strict";
// Importamos la instancia global de Prisma
import prisma from "../config/configDb.js"; 

export async function isAdmin(req, res, next) {
    try {
        if (!req.user?.email) {
            return res.status(401).json({ message: "Usuario no autenticado en la petición." });
        }
        const userFound = await prisma.user.findUnique({
            where: { email: req.user.email },
        });

        if (!userFound) return res.status(404).json("Usuario no encontrado");

        // Verificar el rol del usuario
        if (userFound.role !== "administrador") {
            return res.status(401).json({
                message: "Error al acceder al recurso. Se requiere un rol de Administrador para realizar esta acción.",
            });
        }

        // Si es administrador, continuar
        next();
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
}

// Middleware para verificar si el usuario es profesional 
// (Sugerencia: Cambiar el nombre de 'isUsuario' a 'isProfesional' para que sea descriptivo)
export async function isProfesional(req, res, next) {
    try {
        if (!req.user?.email) {
            return res.status(401).json({ message: "Usuario no autenticado." });
        }

        // Buscar el usuario en Prisma
        const userFound = await prisma.user.findUnique({
            where: { email: req.user.email },
        });

        if (!userFound) return res.status(404).json("Usuario no encontrado");

        // Simplificamos la lógica: si NO es profesional, rebota con 401
        if (userFound.role !== "profesional") {
            return res.status(401).json({
                message: "Error al acceder al recurso. Se requiere un rol de profesional para realizar esta acción.",
            });
        }

        // Si es profesional, continuar
        next();
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
}