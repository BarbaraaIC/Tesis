"use strict";
import {encryptPassword} from "../handlers/bcrypt.helper.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";
import { registroValidation } from "../validations/usuario.validation.js";
import { prisma } from "../config/configDb.js";

export const crearUsuario = async (req, res) => {

    const { error, value} = registroValidation.validate(req.body); 
    if (error) {
        return handleErrorClient(res, 400, error.details[0].message);
    }

    const {
        nombre,apellido,rut,correo,telefono,password,edad,
        ocupacion,
        direccion,
        enfermedades,
        medicamentos,
    } = value;

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
                    edad: value.edad,
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

export const obtenerUsuarios = async (req, res) => {
    try {
        const { rol, sub } = req.usuario;
            const { search } = req.query;

            let filtroBusqueda = {};

                if (search) {
                    filtroBusqueda = {
                        OR: [
                            {
                                nombre: {
                                    contains: search,
                                    mode: "insensitive",
                                },
                            },
                            {
                                apellido: {
                                    contains: search,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    };
                }

        let usuarios;

        if (rol === "administrador") {
            usuarios = await prisma.usuario.findMany();
        } else if (rol === "profesional") {
            const profesional = await prisma.usuario.findUnique({
                where: { rut: sub },
                select: { id_usuario: true }
            });

            const tratamientos = await prisma.tratamientoAsignado.findMany({
                where: { id_profesional: profesional.id_usuario },
                select: { usuario: true },
                distinct: ["id_usuario"]
            });

            usuarios = tratamientos.map(t => t.usuario);
        } else {
            usuarios = await prisma.usuario.findMany({
                where: { rut: sub }
            });
        }

        return handleSuccess(res, 200, "Usuarios obtenidos correctamente.", usuarios);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener usuarios.", error.message);
    }
};


export const cambiarRolUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { rol } = req.body;

        const rolesValidos = ["paciente", "profesional", "administrador"];
        if (!rolesValidos.includes(rol)) {
            return handleErrorClient(res, 400, "Rol inválido. Debe ser: paciente, profesional o administrador.");
        }

        const usuario = await prisma.usuario.update({
            where: { id_usuario: parseInt(id) },
            data: { rol }
        });

        return handleSuccess(res, 200, `Rol actualizado a "${rol}" correctamente.`);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al actualizar el rol.", error.message);
    }
};

/*export const ocultarUsuarios = async (req, res) => {
    REVISAR ESTO DESPUES DE AVANZAR CON LAS RESERVAS
}*/