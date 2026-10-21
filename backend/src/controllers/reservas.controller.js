"use strict";
import { prisma } from "../config/configDb.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";
import { enviarConfirmacionReserva } from "../services/email.service.js";

// El middleware deja la sesión en req.usuario = { rol, sub }, donde sub es el RUT.
// Este helper busca el id_usuario correspondiente.
async function obtenerUsuarioActual(req) {
    return prisma.usuario.findUnique({
        where: { rut: req.usuario?.sub },
        select: { id_usuario: true },
    });
}

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

        // NUEVO: correo de confirmación. No se espera (sin await) para no demorar
        // la respuesta, y si falla solo queda registrado en los logs.
        prisma.reserva
            .findUnique({
                where: { cod_reserva: nuevaReserva.cod_reserva },
                include: {
                    asignacion: {
                        include: {
                            usuario: { select: { nombre: true, apellido: true, correo: true } },
                            profesional: { select: { nombre: true, apellido: true, correo: true } },
                            tratamiento: true,
                        },
                    },
                },
            })
            .then((reservaCompleta) => enviarConfirmacionReserva(reservaCompleta))
            .catch((error) => console.error("Error al enviar la confirmación:", error.message));

        return handleSuccess(res, 201, "Reserva agendada con éxito.", nuevaReserva);

    } catch (error) {
        return handleErrorServer(res, 500, "Error al registrar reserva", error.message);
    }
}

// NUEVO: todas las reservas de todos los roles (solo administrador).
// Protege la ruta con tu middleware de rol administrador.
export const getReservas = async (req, res) => {
    try {
        const reservas = await prisma.reserva.findMany({
            include: {
                asignacion: {
                    include: {
                        // select evita enviar al frontend campos sensibles del usuario
                        usuario: {
                            select: { id_usuario: true, nombre: true, apellido: true },
                        },
                        profesional: {
                            select: { id_usuario: true, nombre: true, apellido: true },
                        },
                        tratamiento: true,
                    },
                },
            },
            orderBy: [{ dia: "asc" }, { hora: "asc" }],
        });

        return handleSuccess(res, 200, "Reservas obtenidas con éxito.", reservas);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener todas las reservas.", error.message);
    }
};

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

export const getDisponibilidadPorProfesional = async (req, res) => {
    try {
        const id_profesional = parseInt(req.params.id_profesional);

        if (!id_profesional){
            return handleErrorClient(res, 400, "El id del profesional no es válido.");
        }

        const reservas = await prisma.reserva.findMany({
            where: {
                asignacion: {
                    id_profesional: id_profesional,
                },
            },
            select: {
                dia: true,
                hora: true,
            },
            orderBy: {
                dia: "asc",
            },
        });

        return handleSuccess(res, 200, "Disponibilidad obtenida con éxito.", reservas);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener la disponibilidad.", error.message);
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

export const cancelarReserva = async (req, res) => {
    try {
        const cod_reserva = parseInt(req.params.cod_reserva);
        if (!cod_reserva) {
            return handleErrorClient(res, 400, "El código de la reserva no es válido.");
        }

        const reserva = await prisma.reserva.findUnique({
            where: {
                cod_reserva: cod_reserva,
            },
            include: { asignacion: true },
        });

        if (!reserva) {
            return handleErrorClient(res, 404, "La reserva no fue encontrada.");
        }

        // NUEVO: solo el administrador, el paciente o el profesional de esa reserva pueden cancelarla
        const esAdmin = req.usuario?.rol === "administrador";
        if (!esAdmin) {
            const usuarioActual = await obtenerUsuarioActual(req);
            const esParticipante =
                !!usuarioActual &&
                (reserva.asignacion.id_usuario === usuarioActual.id_usuario ||
                    reserva.asignacion.id_profesional === usuarioActual.id_usuario);

            if (!esParticipante) {
                return handleErrorClient(res, 403, "No tienes permiso para cancelar esta reserva.");
            }
        }

        await prisma.reserva.delete({
            where: {
                // CORREGIDO: antes decía "cod_reserva: cod_reserva,e" y la "e" suelta
                // lanzaba un ReferenceError, por lo que cancelar siempre devolvía 500.
                cod_reserva: cod_reserva,
            },
        });

        return handleSuccess(res, 200, "Reserva cancelada con éxito.", reserva);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al cancelar la reserva.", error.message);
    }
};

const ESTADOS_ASISTENCIA = ["PENDIENTE", "ASISTIO", "NO_ASISTIO"];

// NUEVO: marcar si el paciente asistió o no a su hora.
// Solo el profesional de esa reserva o un administrador pueden hacerlo.
export const marcarAsistencia = async (req, res) => {
    try {
        const cod_reserva = parseInt(req.params.cod_reserva);
        const { asistencia } = req.body;

        if (!cod_reserva) {
            return handleErrorClient(res, 400, "El código de la reserva no es válido.");
        }

        if (!ESTADOS_ASISTENCIA.includes(asistencia)) {
            return handleErrorClient(res, 400, "El estado de asistencia no es válido.");
        }

        const reserva = await prisma.reserva.findUnique({
            where: { cod_reserva: cod_reserva },
            include: { asignacion: true },
        });

        if (!reserva) {
            return handleErrorClient(res, 404, "La reserva no fue encontrada.");
        }

        const esAdmin = req.usuario?.rol === "administrador";
        const usuarioActual = await obtenerUsuarioActual(req);
        const esSuProfesional =
            !!usuarioActual && reserva.asignacion.id_profesional === usuarioActual.id_usuario;

        if (!esAdmin && !esSuProfesional) {
            return handleErrorClient(res, 403, "No tienes permiso para marcar la asistencia de esta reserva.");
        }

        // No se puede marcar la asistencia de una hora que aún no llega
        const hoy = new Date();
        const hoyTexto =
            hoy.getFullYear() + "-" +
            String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
            String(hoy.getDate()).padStart(2, "0");
        const diaReserva = reserva.dia.toISOString().slice(0, 10);

        if (diaReserva > hoyTexto) {
            return handleErrorClient(res, 400, "No puedes marcar la asistencia de una hora futura.");
        }

        const reservaActualizada = await prisma.reserva.update({
            where: { cod_reserva: cod_reserva },
            data: { asistencia: asistencia },
        });

        return handleSuccess(res, 200, "Asistencia actualizada con éxito.", reservaActualizada);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al actualizar la asistencia.", error.message);
    }
};