"use strict";
import { prisma } from "../config/configDb.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";

const zona_horaria = "America/Santiago";
const calculo_dia = 24 * 60 * 60 * 1000;
const max_dias_rango = 366;
const fecha_val = /^\d{4}-\d{2}-\d{2}$/;
const agrupaciones = ["dia", "semana", "mes"];

const hoyEnChile = () =>
    new Intl.DateTimeFormat("en-CA", { timeZone: zona_horaria }).format(new Date());

const aFecha = (texto) => new Date(`${texto}T00:00:00.000Z`);
const aTexto = (fecha) => fecha.toISOString().slice(0, 10);
const sumarDias = (texto, dias) => aTexto(new Date(aFecha(texto).getTime() + dias * calculo_dia));

const fechaValida = (texto) => {
    if (!fecha_val.test(texto)) return false;
    const fecha = aFecha(texto);
    return !Number.isNaN(fecha.getTime()) && aTexto(fecha) === texto;
};

const clavePeriodo = (texto, agrupar) => {
    if (agrupar === "mes") return texto.slice(0, 7);
    if (agrupar === "semana") {
        const diasDesdeLunes = (aFecha(texto).getUTCDay() + 6) % 7;
        return sumarDias(texto, -diasDesdeLunes);
    }
    return texto;
};

const obtenerActual = async (req) => {
    const actual = await prisma.usuario.findUnique({
        where: { rut: req.usuario?.sub },
        select: { id_usuario: true, rol: { select: { nombre: true } } },
    });
    if (!actual) return null;
    return { id_usuario: actual.id_usuario, rol: (actual.rol?.nombre || "").toLowerCase() };
};

export const getReporte = async (req, res) => {
    try {
        const actual = await obtenerActual(req);
        if (!actual) return handleErrorClient(res, 401, "Usuario no encontrado.");

        const esAdministrador = actual.rol === "administrador";
        const esProfesional = actual.rol === "profesional";
        if (!esAdministrador && !esProfesional) {
            return handleErrorClient(res, 403, "No tienes permiso para ver los reportes.");
        }

        const hoy = hoyEnChile();
        const hasta = String(req.query.hasta ?? hoy);
        const desde = String(req.query.desde ?? sumarDias(hasta, -29));
        const agrupar = String(req.query.agrupar ?? "dia");
        const inactividad = Math.min(365, Math.max(7, parseInt(req.query.inactividad ?? "60", 10) || 60));

        if (!fechaValida(desde) || !fechaValida(hasta)) {
            return handleErrorClient(res, 400, "Las fechas deben tener el formato AAAA-MM-DD.");
        }
        if (desde > hasta) {
            return handleErrorClient(res, 400, "La fecha de inicio no puede ser posterior a la de término.");
        }
        const dias = (aFecha(hasta) - aFecha(desde)) / calculo_dia + 1;
        if (dias > max_dias_rango) {
            return handleErrorClient(res, 400, "El rango no puede superar un año.");
        }
        if (!agrupaciones.includes(agrupar)) {
            return handleErrorClient(res, 400, "La agrupación debe ser dia, semana o mes.");
        }

        const filtroProfesional = esProfesional ? { id_profesional: actual.id_usuario } : {};

        const reservas = await prisma.reserva.findMany({
            where: {
                dia: { gte: aFecha(desde), lte: aFecha(hasta) },
                asignacion: filtroProfesional,
            },
            select: {
                dia: true,
                asistencia: true,
                asignacion: {
                    select: {
                        id_usuario: true,
                        tratamiento: { select: { descripcion: true } },
                    },
                },
            },
        });

        const asistidas = reservas.filter((r) => r.asistencia === "asistio");
        const noAsistio = reservas.filter((r) => r.asistencia === "no_asistio").length;
        const pacientesAtendidos = new Set(asistidas.map((r) => r.asignacion.id_usuario)).size;
        const registradas = asistidas.length + noAsistio;

        const conteoPeriodos = new Map();
        for (let d = desde; d <= hasta; d = sumarDias(d, 1)) {
            conteoPeriodos.set(clavePeriodo(d, agrupar), 0);
        }
        asistidas.forEach((r) => {
            const clave = clavePeriodo(aTexto(r.dia), agrupar);
            conteoPeriodos.set(clave, (conteoPeriodos.get(clave) ?? 0) + 1);
        });
        const serie = [...conteoPeriodos.entries()].map(([periodo, sesiones]) => ({ periodo, sesiones }));

        const porTratamientoMapa = new Map();
        asistidas.forEach((r) => {
            const nombre = r.asignacion.tratamiento?.descripcion ?? "Sin nombre";
            porTratamientoMapa.set(nombre, (porTratamientoMapa.get(nombre) ?? 0) + 1);
        });
        const porTratamiento = [...porTratamientoMapa.entries()]
            .map(([tratamiento, sesiones]) => ({ tratamiento, sesiones }))
            .sort((a, b) => b.sesiones - a.sesiones);

        const limite = sumarDias(hoy, -inactividad);

        const pacientes = await prisma.usuario.findMany({
            where: {
                rol: { nombre: { equals: "paciente", mode: "insensitive" } },
                ...(esProfesional
                    ? { tratamientosAsignados: { some: { id_profesional: actual.id_usuario } } }
                    : {}),
            },
            select: {
                id_usuario: true,
                nombre: true,
                apellido: true,
                telefono: true,
                tratamientosAsignados: {
                    where: filtroProfesional,
                    select: { reservas: { select: { dia: true } } },
                },
            },
        });

        const pacientesSinAgendar = pacientes
            .map((p) => {
                const dias = p.tratamientosAsignados.flatMap((t) => t.reservas.map((r) => aTexto(r.dia)));
                const ultima = dias.length ? dias.reduce((a, b) => (a > b ? a : b)) : null;
                return { p, ultima, tieneFutura: dias.some((d) => d > hoy) };
            })

            .filter(({ ultima, tieneFutura }) => !tieneFutura && (ultima === null || ultima <= limite))
            .map(({ p, ultima }) => ({
                id_usuario: p.id_usuario,
                nombre: p.nombre,
                apellido: p.apellido,
                telefono: p.telefono,
                ultimaReserva: ultima,
                diasSinAgendar: ultima ? Math.floor((aFecha(hoy) - aFecha(ultima)) / calculo_dia) : null,
            }))
            .sort((a, b) => {
                if (a.ultimaReserva === null) return 1;
                if (b.ultimaReserva === null) return -1;
                return a.ultimaReserva.localeCompare(b.ultimaReserva);
            });

        return handleSuccess(res, 200, "Reporte generado.", {
            rango: { desde, hasta, agrupar, inactividad },
            resumen: {
                sesionesRealizadas: asistidas.length,
                pacientesAtendidos,
                noAsistio,
                porcentajeAsistencia: registradas ? Math.round((asistidas.length / registradas) * 100) : null,
            },
            serie,
            porTratamiento,
            pacientesSinAgendar,
        });
    } catch (error) {
        return handleErrorServer(res, 500, "Error al generar el reporte.", error.message);
    }
};