"use strict";
import { encryptPassword } from "../handlers/bcrypt.helper.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";
import { registroValidation } from "../validations/usuario.validation.js";
import { prisma } from "../config/configDb.js";

export const crearUsuario = async (req, res) => {

    const { error, value } = registroValidation.validate(req.body);
    if (error) {
        return handleErrorClient(res, 400, error.details[0].message);
    }

    const {
        nombre, apellido, rut, correo, telefono, password, fecha_nacimiento,
        ocupacion,
        direccion,
        enfermedades,
        medicamentos,
    } = value;

    try {
        const existente = await prisma.usuario.findFirst({
            where: {
                OR: [{ rut: rut }, { correo: correo }, { telefono: telefono }]
            }
        });

        if (existente) {
            if (existente.rut === rut) return handleErrorClient(res, 400, "Ya existe este RUT.");
            if (existente.correo === correo) return handleErrorClient(res, 400, "Ya existe este correo.");
            if (existente.telefono === telefono) return handleErrorClient(res, 400, "Ya existe este teléfono.");
        }

        const hashedPassword = await encryptPassword(password);

        await prisma.usuario.create({
            data: {
                nombre,
                apellido,
                rut,
                correo,
                telefono,
                password: hashedPassword,
                fecha_nacimiento,
                ocupacion,
                direccion,
                enfermedades: enfermedades || null,
                medicamentos: medicamentos || null,
                rol: { connect: { nombre: "paciente" } }
            }
        });

        return handleSuccess(res, 200, "El usuario fue creado exitosamente.");
    } catch (error) {
        return handleErrorServer(res, 500, "Hubo un problema en el servidor al crear el usuario.", error.message);
    }
};

export const obtenerUsuarios = async (req, res) => {
    try {
        const { rol, sub } = req.usuario;
        const { search } = req.query;

        let filtroBusqueda = {};

        if (search && search.trim()) {
            const palabras = search.trim().split(/\s+/);
            filtroBusqueda = {
                AND: palabras.map((palabra) => ({
                    OR: [
                        { nombre: { contains: palabra, mode: "insensitive" } },
                        { apellido: { contains: palabra, mode: "insensitive" } },
                    ],
                })),
            };
        }

        let usuarios;

        if (rol === "administrador") {
            usuarios = await prisma.usuario.findMany({
                where: filtroBusqueda,
            });
        } else if (rol === "profesional") {
            const profesional = await prisma.usuario.findUnique({
                where: { rut: sub },
                select: { id_usuario: true }
            });

            const tratamientos = await prisma.tratamientoAsignado.findMany({
                where: {
                    id_profesional: profesional.id_usuario,
                    usuario: filtroBusqueda,
                },
                select: { usuario: true },
                distinct: ["id_usuario"]
            });

            usuarios = tratamientos.map(t => t.usuario);

        } else if (rol === "paciente") {
            usuarios = await prisma.usuario.findMany({
                where: {
                    AND: [
                        { rol: { nombre: "profesional" } },
                        filtroBusqueda,
                    ],
                },
            });
        } else {
            usuarios = await prisma.usuario.findMany({
                where: {
                    AND: [
                        { rut: sub },
                        filtroBusqueda,
                    ],
                },
            });
        }

        const usuariosSinPassword = usuarios.map(({ password, ...resto }) => resto);

        return handleSuccess(res, 200, "Usuarios obtenidos correctamente.", usuariosSinPassword);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener usuarios.", error.message);
    }
};

export const obtenerProfesionales = async (req, res) => {
    try {
        const profesionales = await prisma.usuario.findMany({
            where: { rol: { nombre: "profesional" } },
            select: {
                id_usuario: true,
                nombre: true,
                apellido: true,
                rol: { select: { nombre: true } },
            },
        });


        const resultado = profesionales.map(p => ({ ...p, rol: p.rol.nombre }));

        return handleSuccess(res, 200, "Profesionales obtenidos correctamente.", resultado);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al obtener profesionales.", error.message);
    }
};

export const cambiarRolUsuario = async (req, res) => {
    try {
        const idUsuario = parseInt(req.params.id);
        const { rol } = req.body;

        if (!idUsuario) {
            return handleErrorClient(res, 400, "El id del usuario no es válido.");
        }

        const rolesValidos = ["paciente", "profesional", "administrador"];
        if (!rolesValidos.includes(rol)) {
            return handleErrorClient(res, 400, "Rol inválido. Debe ser: paciente, profesional o administrador.");
        }

        const usuario = await prisma.usuario.findUnique({
            where: { id_usuario: idUsuario },
            select: { rut: true, rol: { select: { nombre: true } } },
        });

        if (!usuario) {
            return handleErrorClient(res, 404, "El usuario no existe.");
        }

        if (usuario.rut === req.usuario.sub) {
            return handleErrorClient(res, 400, "No puedes cambiar tu propio rol.");
        }

        if (usuario.rol?.nombre === rol) {
            return handleErrorClient(res, 400, `El usuario ya tiene el rol "${rol}".`);
        }

        await prisma.usuario.update({
            where: { id_usuario: idUsuario },
            data: { rol: { connect: { nombre: rol } } },
        });

        return handleSuccess(res, 200, `Rol actualizado a "${rol}" correctamente.`);
    } catch (error) {
        return handleErrorServer(res, 500, "Error al actualizar el rol.", error.message);
    }
};

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
            nombre, apellido, rut, correo, telefono, password, fecha_nacimiento,
            ocupacion, direccion, enfermedades, medicamentos,
            autoriza_datos_salud,
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

        if (
            usuarioExistente.autoriza_datos_salud &&
            autoriza_datos_salud !== undefined &&
            autoriza_datos_salud !== true
        ) {
            return handleErrorClient(res, 400, "La autorización de datos de salud ya fue aceptada y no se puede modificar.");
        }

        let autorizaFinal = usuarioExistente.autoriza_datos_salud;
        if (autoriza_datos_salud !== undefined) {
            autorizaFinal = Boolean(autoriza_datos_salud);
        }

        const enviaDatosDeSalud = Boolean(enfermedades) || Boolean(medicamentos);
        if (enviaDatosDeSalud && !autorizaFinal) {
            return handleErrorClient(res, 400, "Para guardar datos de salud debes aceptar la autorización de uso.");
        }

        const datosActualizados = {};

        if (nombre) datosActualizados.nombre = nombre;
        if (apellido) datosActualizados.apellido = apellido;
        if (rut) datosActualizados.rut = rut;
        if (correo) datosActualizados.correo = correo;
        if (telefono) datosActualizados.telefono = telefono;
        if (fecha_nacimiento) datosActualizados.fecha_nacimiento = fecha_nacimiento;
        if (ocupacion) datosActualizados.ocupacion = ocupacion;
        if (direccion) datosActualizados.direccion = direccion;
        if (enfermedades !== undefined) datosActualizados.enfermedades = enfermedades || null;
        if (medicamentos !== undefined) datosActualizados.medicamentos = medicamentos || null;

        if (autoriza_datos_salud !== undefined) {
            datosActualizados.autoriza_datos_salud = autorizaFinal;
            if (autorizaFinal && !usuarioExistente.autoriza_datos_salud) {
                datosActualizados.fecha_autorizacion = new Date();
            }
        }

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
};