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