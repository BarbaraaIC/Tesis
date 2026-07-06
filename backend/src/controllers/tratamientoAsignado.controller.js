"use strict";
import { prisma } from "../config/configDb.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";

export const asignarTratamiento = async (req, res) => {
    try {
        const { id_usuario, id_profesional, cod_tratamiento, observaciones } = req.body;

        if (!id_usuario || !id_profesional || !cod_tratamiento) {
            return handleErrorClient(res, 400, "Faltan campos obligatorios");
        }

        const usuario = parseInt(id_usuario);
        const profesional = parseInt(id_profesional);
        const codTratamiento = parseInt(cod_tratamiento);

        const paciente = await prisma.usuario.findUnique({
            where: { id_usuario: usuario }
        });

        if (!paciente) {
            return handleErrorClient(res, 444, "El usuario especificado no existe.");
        }

        if (paciente.rol !== "paciente") {
            return handleErrorClient(res, 403, "Acceso denegado: Solo se pueden asignar tratamientos a usuarios con el rol 'paciente'");
        }

        const profesionalVerificar = await prisma.usuario.findUnique({
            where: { id_usuario: profesional }
        });

        if (!profesionalVerificar || profesionalVerificar.rol !== "profesional") { 
            return handleErrorClient(res, 403, "Acceso denegado: El ID actual no corresponde a un profesional autorizado.");
}

        const tratamientoExiste = await prisma.tratamiento.findUnique({
            where: { cod_tratamiento: codTratamiento }
        });
        if (!tratamientoExiste) {
            return handleErrorClient(res, 404, `El tratamiento con código ${codTratamiento} no existe.`);
        }

        const nuevoTratamiento = await prisma.tratamientoAsignado.create({
            data: {
                id_usuario: usuario,
                id_profesional: profesional,
                cod_tratamiento: codTratamiento, 
                observaciones: observaciones || null,
                fecha_asignacion: new Date(), 
                estado_actual: "Activo"
            }
        });

        return handleSuccess(res, 201, "Tratamiento asignado con éxito.", nuevoTratamiento);

    } catch (error) {
        return handleErrorServer(res, 500, "Error al asignar tratamiento.", error);
    }
};