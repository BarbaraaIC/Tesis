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
            where: { id_asignacion: asignacionTratamiento}
        });

        if (!asignacionExiste) {
            return handleErrorClient(res, 404, "La asignación de tratamiento especificada no existe.");
        }

        const nuevaReserva = await prisma.reserva.create({
            data: {
                dia: new Date(dia),                     
                hora: new Date(`${dia}T${hora}`),      
                tiempo_estimado: new Date(`${dia}T${tiempo_estimado}`),
                id_asignacion: asignacionTratamiento
            }
        });

        return handleSuccess(res, 201, "Reserva agendada con éxito.", nuevaReserva);

    } catch (error) {
        return handleErrorServer(res, 500, "Error al registrar reserva", error.message);
    }
}