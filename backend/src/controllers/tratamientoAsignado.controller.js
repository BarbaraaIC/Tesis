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

export const getProfesionalesPorPaciente = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const paciente = parseInt(id_usuario);

        const asignaciones = await prisma.tratamientoAsignado.findMany({
            where: { id_usuario: paciente },
            distinct: ['id_profesional'],
            include: {
                profesional: true,
            },
        });

        const profesionales = await prisma.usuario.findMany({
            where: {
                rol: "profesional",
                tratamientosAsignadosPor: {
                    some: {
                        id_usuario: paciente,
                    },
                },
            },
        });

        return handleSuccess(res, 200, "Profesionales obtenidos con éxito.", profesionales);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener los profesionales del paciente.", error);
    }
};

export const actualizarAsistencia = async (req, res) => {
    try {
        const id_asignacion = parseInt(req.params.id_asignacion);
        const { estado_actual, observaciones } = req.body;

        const estadosValidos = ["Asistio", "No asistio"];
        if (!estadosValidos.includes(estado_actual)) {
            return handleErrorClient(res, 400, "Estado no válido.");
        }

        const asignacionExiste = await prisma.tratamientoAsignado.findUnique({
            where: { id_asignacion: id_asignacion }
        });

        if (!asignacionExiste) {
            return handleErrorClient(res, 404, "La asignación especificada no existe.");
        }

        const asignacionActualizada = await prisma.tratamientoAsignado.update({
            where: { id_asignacion: id_asignacion },
            data: {
                estado_actual: estado_actual,
                observaciones: observaciones || null,
            },
        });

        return handleSuccess(res, 200, "Asistencia actualizada con éxito.", asignacionActualizada);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al actualizar la asistencia.", error);
    }
};