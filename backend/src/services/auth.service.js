"use strict";
import jwt from "jsonwebtoken";
import { prisma } from "../config/configDb.js";
import { comparePassword } from "../handlers/bcrypt.helper.js";
import { findUserByEmail } from "./user.service.js";


const generarSesion = (usuario) => {
    const nombreRol = usuario.rol?.nombre || "paciente";

    const payload = {
        sub: usuario.rut,
        correo: usuario.correo,
        rol: nombreRol,
    };

    const secretKey = process.env.JWT_SECRET || "clave_secreta_por_defecto_tesis";
    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

    const { password, rol, ...resto } = usuario;
    const user = { ...resto, rol: nombreRol };

    return { user, token };
};

export const loginUser = async (correo, password) => {
    const usuario = await findUserByEmail(correo);

    if (!usuario) {
        throw new Error("Credenciales incorrectas");
    }
    const isMatch = await comparePassword(password, usuario.password);
    if (!isMatch) {
        throw new Error("Credenciales incorrectas");
    }

    return generarSesion(usuario);
};


export const loginUserConGoogle = async (correo) => {
    const usuario = await findUserByEmail(correo);

    if (!usuario) {
        throw new Error("Usuario no registrado");
    }

    return generarSesion(usuario);
};

export const registerUserConGoogle = async ({
    correo, nombre, apellido, rut, telefono, password,
    fecha_nacimiento, direccion, ocupacion, enfermedades, medicamentos,
}) => {
    const usuario = await prisma.usuario.create({
        data: {
            correo,
            nombre,
            apellido,
            rut,
            direccion,
            telefono,
            enfermedades: enfermedades ?? null,
            medicamentos: medicamentos ?? null,
            ocupacion,
            fecha_nacimiento: new Date(fecha_nacimiento),
            autoriza_datos_salud: false,
            password,
            rol: { connect: { nombre: "paciente" } },
        },
        include: { rol: true },
    });

    return generarSesion(usuario);
};