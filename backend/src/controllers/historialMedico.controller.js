"use strict";
import { prisma } from "../config/configDb.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";

const ZONA_HORARIA = "America/Santiago";

const estados_asistencia = ["asistio", "no_asistio"];

const aDia = (fecha) => fecha.toISOString().slice(0, 10);     // "2026-10-17"
const aHora = (fecha) => fecha.toISOString().slice(11, 16);   // "18:00"
const aMinutos = (fecha) => {
    const [horas, minutos] = aHora(fecha).split(":").map(Number);
    return horas * 60 + minutos;
};

const hoyEnChile = () =>
    new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_HORARIA }).format(new Date());

const obtenerActual = async (req) => {
    const actual = await prisma.usuario.findUnique({
        where: { rut: req.usuario?.sub },
        select: {
            id_usuario: true,
            rol: { select: { nombre: true } },
        },
    });
    if (!actual) return null;
    return {
        id_usuario: actual.id_usuario,
        rol: (actual.rol?.nombre || "").toLowerCase(),
    };
};

const listarPacientesVisibles = async (actual, res) => {
    const esProfesional = actual.rol === "profesional";
    const esAdministrador = actual.rol === "administrador";

    if (!esProfesional && !esAdministrador) {
        return handleErrorClient(res, 403, "No tienes permiso para ver pacientes.");
    }

    const datosPublicos = {
        id_usuario: true,
        nombre: true,
        apellido: true,
        rut: true,
        autoriza_datos_salud: true,
    };

    let usuarios;
    if (esAdministrador) {
        usuarios = await prisma.usuario.findMany({
            where: { rol: { nombre: { equals: "paciente", mode: "insensitive" } } },
            select: datosPublicos,
        });
    } else {
        const asignaciones = await prisma.tratamientoAsignado.findMany({
            where: { id_profesional: actual.id_usuario },
            distinct: ["id_usuario"],
            select: { usuario: { select: datosPublicos } },
        });
        usuarios = asignaciones.map((asignacion) => asignacion.usuario);
    }

    const pacientes = usuarios
        .map((usuario) => ({
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            rut: usuario.rut,
            autorizado: Boolean(usuario.autoriza_datos_salud),
        }))
        .sort((a, b) => `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es"));

    return handleSuccess(res, 200, "Pacientes obtenidos con éxito.", pacientes);
};

export const getHistorialPaciente = async (req, res) => {
    try {
        const actual = await obtenerActual(req);
        if (!actual) {
            return handleErrorClient(res, 401, "La sesión no es válida.");
        }

        if (req.params.id_usuario === "pacientes") {
            return await listarPacientesVisibles(actual, res);
        }

        let idPaciente;
        if (req.params.id_usuario === "mio") {
            if (actual.rol !== "paciente") {
                return handleErrorClient(res, 400, "Indica el id del paciente.");
            }
            idPaciente = actual.id_usuario;
        } else {
            idPaciente = parseInt(req.params.id_usuario);
        }

        if (!idPaciente) {
            return handleErrorClient(res, 400, "El id del paciente no es válido.");
        }

        const esProfesional = actual.rol === "profesional";
        const esAdministrador = actual.rol === "administrador";
        const puedeRegistrar = esProfesional || esAdministrador;

        if (actual.rol === "paciente") {
            if (actual.id_usuario !== idPaciente) {
                return handleErrorClient(res, 403, "No tienes permiso para ver este historial.");
            }
        } else if (esProfesional) {
            const vinculo = await prisma.tratamientoAsignado.findFirst({
                where: { id_usuario: idPaciente, id_profesional: actual.id_usuario },
                select: { id_asignacion: true },
            });
            if (!vinculo) {
                return handleErrorClient(res, 403, "No tienes permiso para ver este historial.");
            }
        } else if (!esAdministrador) {
            return handleErrorClient(res, 403, "No tienes permiso para ver este historial.");
        }

        const paciente = await prisma.usuario.findUnique({
            where: { id_usuario: idPaciente },
            select: {
                nombre: true,
                apellido: true,
                enfermedades: true,
                medicamentos: true,
                autoriza_datos_salud: true,
                fecha_autorizacion: true,
            },
        });
        if (!paciente) {
            return handleErrorClient(res, 404, "El paciente no fue encontrado.");
        }

        if (!paciente.autoriza_datos_salud) {
            const mensaje = actual.rol === "paciente"
                ? "Debes aceptar la autorización de uso de datos de salud para ver tu historial."
                : "El paciente no ha autorizado el uso de sus datos de salud.";
            return handleErrorClient(res, 403, mensaje);
        }

        const { autoriza_datos_salud, ...pacientePublico } = paciente;

        const reservas = await prisma.reserva.findMany({
            where: {
                asignacion: {
                    id_usuario: idPaciente,
                    ...(esProfesional ? { id_profesional: actual.id_usuario } : {}),
                },
            },
            include: {
                asignacion: {
                    include: {
                        profesional: { select: { nombre: true, apellido: true } },
                        tratamiento: true,
                    },
                },
            },
            orderBy: [{ dia: "desc" }, { hora: "desc" }],
        });

        const hoy = hoyEnChile();

        const realizadas = reservas.filter((reserva) => reserva.asistencia === "asistio");
        const pasadas = reservas.filter((reserva) => reserva.asistencia !== "pendiente");
        const proxima = reservas
            .filter((reserva) => reserva.asistencia === "pendiente" && aDia(reserva.dia) >= hoy)
            .at(-1);

        const pendientesPorRegistrar = puedeRegistrar
            ? reservas
                .filter((reserva) => reserva.asistencia === "pendiente" && aDia(reserva.dia) <= hoy)
                .map((reserva) => ({
                    cod_reserva: reserva.cod_reserva,
                    dia: aDia(reserva.dia),
                    hora: aHora(reserva.hora),
                    tratamiento: reserva.asignacion.tratamiento.descripcion,
                    observaciones: reserva.asignacion.observaciones ?? "",
                }))
            : [];

        const referencia = proxima ?? realizadas[0] ?? reservas[0];

        const sesiones = pasadas.map((reserva) => ({
            cod_reserva: reserva.cod_reserva,
            dia: aDia(reserva.dia),
            hora: aHora(reserva.hora),
            asistencia: reserva.asistencia,
            tratamiento: reserva.asignacion.tratamiento.descripcion,
            profesional: `${reserva.asignacion.profesional.nombre} ${reserva.asignacion.profesional.apellido}`,
            duracion_min: aMinutos(reserva.tiempo_estimado),
            nota: reserva.asignacion.observaciones ?? "",
        }));

        return handleSuccess(res, 200, "Historial obtenido con éxito.", {
            paciente: pacientePublico,
            puedeRegistrar,
            pendientesPorRegistrar,
            resumen: {
                plan: referencia?.asignacion.tratamiento.descripcion ?? null,
                sesionesPlan: referencia?.asignacion.sesiones_plan ?? null,
                sesionesRealizadas: realizadas.length,
                proximaHora: proxima ? { dia: aDia(proxima.dia), hora: aHora(proxima.hora) } : null,
            },
            sesiones,
        });
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener el historial.", error.message);
    }
};

export const registrarSesion = async (req, res) => {
    try {
        const cod_reserva = parseInt(req.params.cod_reserva);
        const { asistencia, nota, observaciones: observacionesBody } = req.body;

        if (!cod_reserva) {
            return handleErrorClient(res, 400, "El código de la reserva no es válido.");
        }
        if (!estados_asistencia.includes(asistencia)) {
            return handleErrorClient(res, 400, "El estado de asistencia no es válido.");
        }

        const observaciones = String(nota ?? observacionesBody ?? "").trim();
        if (observaciones.length > 500) {
            return handleErrorClient(res, 400, "La descripción no puede superar los 500 caracteres.");
        }
        if (asistencia === "asistio" && observaciones.length < 5) {
            return handleErrorClient(res, 400, "Describe brevemente lo que se hizo en la sesión.");
        }

        const actual = await obtenerActual(req);
        if (!actual) {
            return handleErrorClient(res, 401, "La sesión no es válida.");
        }
        if (actual.rol !== "profesional" && actual.rol !== "administrador") {
            return handleErrorClient(res, 403, "No tienes permiso para registrar sesiones.");
        }

        const reserva = await prisma.reserva.findUnique({
            where: { cod_reserva },
            include: {
                asignacion: {
                    include: { usuario: { select: { autoriza_datos_salud: true } } },
                },
            },
        });
        if (!reserva) {
            return handleErrorClient(res, 404, "La reserva no fue encontrada.");
        }

        if (actual.rol === "profesional" && reserva.asignacion.id_profesional !== actual.id_usuario) {
            return handleErrorClient(res, 403, "Solo puedes registrar tus propias sesiones.");
        }

        if (!reserva.asignacion.usuario.autoriza_datos_salud) {
            return handleErrorClient(res, 403, "El paciente no ha autorizado el uso de sus datos de salud.");
        }

        if (aDia(reserva.dia) > hoyEnChile()) {
            return handleErrorClient(res, 400, "No puedes registrar una sesión futura.");
        }

        if (reserva.asistencia !== "pendiente") {
            return handleErrorClient(res, 409, "Esta sesión ya fue registrada.");
        }

        const registrada = await prisma.$transaction(async (tx) => {
            const resultado = await tx.reserva.updateMany({
                where: { cod_reserva, asistencia: "pendiente" },
                data: { asistencia },
            });
            if (resultado.count === 0) return false;

            await tx.tratamientoAsignado.update({
                where: { id_asignacion: reserva.id_asignacion },
                data: { observaciones: observaciones || null },
            });
            return true;
        });

        if (!registrada) {
            return handleErrorClient(res, 409, "Esta sesión ya fue registrada.");
        }

        return handleSuccess(res, 200, "Sesión registrada con éxito.", { cod_reserva });
    } catch (error) {
        return handleErrorServer(res, 500, "Error al registrar la sesión.", error.message);
    }
};