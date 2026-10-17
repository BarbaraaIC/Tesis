"use strict";
import { prisma } from "../config/configDb.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";

export const crearTratamiento = async (req, res) => {
    try {
        const { costo, descripcion, id_servicio } = req.body;

        if (!id_servicio) {
            return handleErrorClient(res, 400, "El campo id_servicio es obligatorio.");
        }

        const servicioBuscar = await prisma.servicio.findUnique({
            where: { 
                id_servicio: parseInt(id_servicio) 
            }
        });

        if (!servicioBuscar) {
            return handleErrorClient(res, 404, "No existe un servicio con ese ID.");
        }

        const nuevoTratamiento = await prisma.tratamiento.create({
            data: {
                costo: parseInt(costo),
                descripcion: descripcion,
                id_servicio: parseInt(id_servicio)
            }
        });

        return handleSuccess(res, 201, "Tratamiento creado exitosamente.", nuevoTratamiento);

    } catch (error) {
        return handleErrorServer(res, 500, "Error al crear el tratamiento.", error.message);
    }
};

export const obtenerTratamientos = async (req, res) => {
        try {
        const { search } = req.query;

        let filtroBusqueda = {};

        if (search) {
            filtroBusqueda = {
                OR: [
                    { 
                        cod_tratamiento: { 
                            contains: search, 
                            mode: "insensitive" 
                        } 
                    },
                    { 
                        descripcion: { 
                            contains: search, 
                            mode: "insensitive" 
                        } 
                    }
                ]
            };
        }
        const tratamientos = await prisma.tratamiento.findMany({
            where: filtroBusqueda,
            orderBy: { cod_tratamiento: 'asc' }
        });

        return handleSuccess(res, 200, "Tratamientos obtenidos correctamente.", tratamientos);

    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener tratamientos.", error.message);
    }
}

export const obtenerTratamientoPorId = async (req, res) => {
    try {
        const { id_servicio } = req.params;
        
        const tratamiento = await prisma.tratamiento.findMany({
            where: { id_servicio: parseInt(id_servicio) }
        });

        if (!tratamiento) return handleErrorClient(res, 404, "Tratamiento no encontrado.");
        
        return handleSuccess(res, 200, "Tratamiento encontrado.", tratamiento);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al buscar el tratamiento.", error.message);
    }
};

export const cambiarEstadoTratamiento = async (req, res) => {
    try {
        const cod_tratamiento = parseInt(req.params.cod_tratamiento, 10);

        if (isNaN(cod_tratamiento)) {
            return handleErrorClient(res, 400, "Código de tratamiento inválido.");
        }

        const tratamiento = await prisma.tratamiento.findUnique({
            where: { cod_tratamiento },
            include: { servicio: true }
        });

        if (!tratamiento) {
            return handleErrorClient(res, 404, "Tratamiento no encontrado.");
        }

        const nuevoEstado = !tratamiento.activo;

        if (nuevoEstado && !tratamiento.servicio.activo) {
            return handleErrorClient(res,409,"No se puede activar el tratamiento porque su servicio está inactivo.");
        }

        await prisma.tratamiento.update({
            where: { cod_tratamiento },
            data: {
                activo: nuevoEstado,
            }
        });

        return handleSuccess( res,200,nuevoEstado 
            ? "Tratamiento activado correctamente." : "Tratamiento desactivado correctamente.",
            { activo: nuevoEstado }
        );

    } catch (error) {
        return handleErrorServer(res, 500, "Error al cambiar el estado del tratamiento.", error.message);
    }
};