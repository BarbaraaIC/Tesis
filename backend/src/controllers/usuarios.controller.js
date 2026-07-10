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

export const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { rol, sub } = req.usuario;

        const usuarioExistente = await prisma.usuario.findUnique({
            where: { id_usuario: parseInt(id) }
        });

        if (!usuarioExistente) {
            return handleErrorClient(res, 404, "El usuario no existe.");
        }

        if (rol !== "administrador" && sub !== usuarioExistente.rut) {
            return handleErrorClient(res, 403, "No tienes permiso para editar este usuario.");
        }

        const {
            nombre, apellido, rut, correo, telefono, password, edad,
            ocupacion, direccion, enfermedades, medicamentos,
        } = req.body;

        if (rut || correo || telefono) {
            const filtroDuplicados = [];
            if (rut) filtroDuplicados.push({ rut });
            if (correo) filtroDuplicados.push({ correo });
            if (telefono) filtroDuplicados.push({ telefono });

            const duplicado = await prisma.usuario.findFirst({
                where: {
                    AND: [
                        { id_usuario: { not: parseInt(id) } },
                        { OR: filtroDuplicados }
                    ]
                }
            });

            if (duplicado) {
                if (duplicado.rut === rut) return handleErrorClient(res, 400, "Ya existe este RUT.");
                if (duplicado.correo === correo) return handleErrorClient(res, 400, "Ya existe este correo.");
                if (duplicado.telefono === telefono) return handleErrorClient(res, 400, "Ya existe este teléfono.");
            }
        }

        const datosActualizados = {};

        if (nombre) datosActualizados.nombre = nombre;
        if (apellido) datosActualizados.apellido = apellido;
        if (rut) datosActualizados.rut = rut;
        if (correo) datosActualizados.correo = correo;
        if (telefono) datosActualizados.telefono = telefono;
        if (edad) datosActualizados.edad = edad;
        if (ocupacion) datosActualizados.ocupacion = ocupacion;
        if (direccion) datosActualizados.direccion = direccion;
        if (enfermedades !== undefined) datosActualizados.enfermedades = enfermedades || null;
        if (medicamentos !== undefined) datosActualizados.medicamentos = medicamentos || null;

        if (password) {
            datosActualizados.password = await encryptPassword(password);
        }

        const usuarioActualizado = await prisma.usuario.update({
            where: { id_usuario: parseInt(id) },
            data: datosActualizados
        });

        return handleSuccess(res, 200, "Datos de usuario actualizado correctamente.", usuarioActualizado);
    } catch (error) {
        return handleErrorServer(res, 500, "Hubo un problema en el servidor al datos del usuario.", error.message);
    }
}