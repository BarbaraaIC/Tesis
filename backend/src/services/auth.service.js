"use strict";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/configDb.js";
import { comparePassword } from "../handlers/bcrypt.helper.js";
import { findUserByEmail } from "./user.service.js";


const generarSesion = (usuario) => {
    const payload = {
        sub: usuario.rut,
        correo: usuario.correo,
        rol: usuario.rol || "paciente",
    };

    const secretKey = process.env.JWT_SECRET || "clave_secreta_por_defecto_tesis";
    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

    const { password, ...user } = usuario;

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
    correo, nombre, apellido, rut, telefono,
    fecha_nacimiento, direccion, ocupacion, enfermedades, medicamentos,
}) => {
    const passwordAleatoria = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);

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
            password: passwordAleatoria,
            rol: "paciente",
        },
    });

    return generarSesion(usuario);
};
