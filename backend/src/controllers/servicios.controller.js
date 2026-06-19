"use strict"
import { prisma } from "../config/configDb.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";
import { crearServicioValidation } from "../validations/servicio.validations.js";


export const crearServicio = async (req, res) => {

    const { error, value} = crearServicioValidation.validate(req.body); 
    if (error) {
        return handleErrorClient(res, 400, error.details[0].message);
    }
    
    try{
        const{tipo_servicio, descripcion} = req.body;

        const existente = await prisma.servicio.findFirst({
            where: {
                OR: [{ tipo_servicio: tipo_servicio}]
            }
        });
        if(existente){
            if(existente.tipo_servicio === tipo_servicio) return handleErrorClient (res, 400, "Ya existe este servicio.")
        }

        const {correo, rol, sub: rut } = req.usuario; 
            console.log(`Servicio creado por el usuario con RUT: ${rut}, Correo: ${correo} y Rol: ${rol}`);

        if(!tipo_servicio || !descripcion){
            return handleErrorClient(res, 400, "Se debe ingresar el tipo de servicio y una breve descripción");
        }

        const nuevoServicio = await prisma.servicio.create({
            data: {
                tipo_servicio,
                descripcion,
            },
        });

        return handleSuccess(res, 200, "Servicio creado exitosamente");

    }catch(error){
        return handleErrorServer(res, 500, "Hubo un problema con el servidor al crear el servicio.", error.message);
    }
}

export const editarServicio = async (req, res) => {
    
    try{
        const {id_servicio} = req.params;
        const {tipo_servicio, descripcion} = req.body;

            const servicioExistente = await prisma.servicio.findUnique({
                where: {id_servicio: parseInt(id_servicio)}
            });

                if(!servicioExistente){
                    return handleErrorClient(res, 400, "Servicio no encontrado");
                }

                    const datosParaActualizar = {};

                    if(tipo_servicio && tipo_servicio !== servicioExistente.tipo_servicio){
                        const servicioDuplicado = await prisma.servicio.findFirst({
                            where : {
                                tipo_servicio,
                            NOT: {id_servicio: parseInt(id_servicio)}
                            }
                        });
                        if(servicioDuplicado){
                            return handleErrorClient(res, 400, "Ya existe otro servicio con ese nombre.");
                        }
                        datosParaActualizar.tipo_servicio = tipo_servicio;
                    }

                            if (descripcion && descripcion !== servicioExistente.descripcion) {
                                datosParaActualizar.descripcion = descripcion;
                            }

                                if (Object.keys(datosParaActualizar).length === 0) {
                                    return handleErrorClient(res, 400, "No se realizaron cambios: los datos enviados son iguales a los actuales.");
                                }

                                    const servicioActualizado = await prisma.servicio.update({
                                        where: { id_servicio: parseInt(id_servicio) },
                                        data: datosParaActualizar
                                    });

                                        return handleSuccess(res, 200, "Servicio actualizado correctamente.", servicioActualizado);

                    }catch(error){
                        return handleErrorServer(res, 500, "Error al actualizar el servicio.", error.message);
                    }
}

export const obtenerServicios = async (req, res) => {
    try {
        const { search } = req.query;

        let filtroBusqueda = {};

        if (search) {
            filtroBusqueda = {
                OR: [
                    { 
                        tipo_servicio: { 
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
        const servicios = await prisma.servicio.findMany({
            where: filtroBusqueda,
            orderBy: { tipo_servicio: 'asc' }
        });

        return handleSuccess(res, 200, "Servicios obtenidos correctamente.", servicios);

    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener servicios.", error.message);
    }
}

export const eliminarServicio = async (req, res) => {
    try {
        const { tipo_servicio} = req.params;

        const servicioExistente = await prisma.servicio.findFirst({
            where: { tipo_servicio: tipo_servicio }
        });

        if (!servicioExistente) {
            return handleErrorClient(res, 404, "No se puede eliminar: Servicio no encontrado.");
        }

        await prisma.servicio.delete({
            where: { id_servicio: servicioExistente.id_servicio}
        });

        return handleSuccess(res, 200, "Servicio eliminado correctamente.");

    } catch (error) {
        return handleErrorServer(res, 500, "Error al eliminar el servicio.", error.message);
    }
}