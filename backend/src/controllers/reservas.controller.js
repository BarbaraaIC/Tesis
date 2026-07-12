"use strict";
import { prisma } from "../config/configDb.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";

export const crearReserva = async (req, res) => {
    try {
        const { dia, hora, tiempo_estimado, id_asignacion } = req.body;

        if (!dia || !hora || !tiempo_estimado || !id_asignacion) {
            return handleErrorClient(res, 400, "Todos los campos son obligatorios.");
        }

        const asignacionTratamiento = parseInt(id_asignacion);

        const asignacionExiste = await prisma.tratamientoAsignado.findUnique({
            where: { id_asignacion: asignacionTratamiento },
        });

        if (!asignacionExiste) {
            return handleErrorClient(res, 404, "La asignación de tratamiento especificada no existe.");
        }

        const fechaDia = new Date(dia);
        const fechaHora = new Date(`${dia}T${hora}`);

        const reservaExistente = await prisma.reserva.findFirst({
            where: {
                dia: fechaDia,
                hora: fechaHora,
                asignacion: {
                    id_profesional: asignacionExiste.id_profesional,
                },
            },
        });

        if (reservaExistente) {
            return handleErrorClient(res, 409, "Ese horario ya fue reservado por otra persona. Elige otro horario.");
        }

        const nuevaReserva = await prisma.reserva.create({
            data: {
                dia: fechaDia,
                hora: fechaHora,
                tiempo_estimado: new Date(`${dia}T${tiempo_estimado}`),
                id_asignacion: asignacionTratamiento,
            },
        });

        return handleSuccess(res, 201, "Reserva agendada con éxito.", nuevaReserva);

    } catch (error) {
        return handleErrorServer(res, 500, "Error al registrar reserva", error.message);
    }
}

export const getReservasPorProfesional = async (req, res) => {
    try {
        const id_profesional = parseInt(req.params.id_profesional);

        const reservas = await prisma.reserva.findMany({
            where: {
                asignacion: {
                    id_profesional: id_profesional,
                },
            },
            include: {
                asignacion: {
                    include: {
                        usuario: true,
                        tratamiento: true,
                    },
                },
            },
            orderBy: {
                dia: "asc",
            },
        });

        return handleSuccess(res, 200, "Reservas obtenidas con éxito.", reservas);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener las reservas.", error);
    }
};

export const getReservasPorUsuario = async (req, res) => {
    try {
        const id_usuario = parseInt(req.params.id_usuario);

        const reservas = await prisma.reserva.findMany({
            where: {
                asignacion: {
                    id_usuario: id_usuario,
                },
            },
            include: {
                asignacion: {
                    include: {
                        profesional: true,
                        tratamiento: true,
                    },
                },
            },
            orderBy: {
                dia: "asc",
            },
        });

        return handleSuccess(res, 200, "Reservas obtenidas con éxito.", reservas);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener las reservas agendadas.", error);
    }
};