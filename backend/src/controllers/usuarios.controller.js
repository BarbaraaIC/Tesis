"use strict";
import {encryptPassword} from "../handlers/bcrypt.helper.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";
import { registroValidation } from "../validations/usuario.validation.js";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const crearUsuario = async (req, res) => {

    const { error } = registroValidation.validate(req.body); 
    if (error) {
        return handleErrorClient(res, 400, error.details[0].message);
    }

    const {
        nombre,apellido,rut,correo,telefono,password,edad,
        ocupacion,
        direccion,
        enfermedades,
        medicamentos,
    } = req.body;

    try{
        const existente = await prisma.usuario.findFirst({
            where: {
                OR: [{ rut: rut},{ correo: correo},{ telefono: telefono}]
            }
        });

        if(existente){
            if(existente.rut === rut) return handleErrorClient (res, 400, "Ya existe este RUT.")
            if(existente.correo === correo) return handleErrorClient (res, 400, "Ya existe este correo.")
            if (existente.telefono === telefono) return handleErrorClient (res, 400, "Ya existe este teléfono.")
        }

            const hashedPassword = await encryptPassword(password);
            
            const nuevoUsuario = await prisma.usuario.create({
                data: {
                    nombre,
                    apellido,
                    rut,
                    correo,
                    telefono,
                    password: hashedPassword,
                    edad,
                    ocupacion,
                    direccion,
                    enfermedades: enfermedades || null,
                    medicamentos: medicamentos || null,
                    rol: "paciente"
                }
            });

            return handleSuccess (res, 200, "El usuario fue creado exitosamente.")
    }catch(error){
        return handleErrorServer (res, 500, "Hubo un problema en el servidor al crear el usuario." , error.message)
    }
}