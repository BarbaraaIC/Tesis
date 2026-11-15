"use strict";
import { OAuth2Client } from "google-auth-library";
import {loginUser,loginUserConGoogle,registerUserConGoogle} from "../services/auth.service.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";
import { encryptPassword } from "../handlers/bcrypt.helper.js";
import { prisma } from "../config/configDb.js";

const clienteGoogle = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const rut_val = /^\d{1,2}\.\d{3}\.\d{3}-[0-9kK]{1}$/;
const telefono_val = /^(?:\+?56)?9[0-9]{8}$/;
const password_val = /^(?=.*\d)[^.,?= \s]{8,30}$/;

async function verificarGoogle(credential) {
    const ticket = await clienteGoogle.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload.email || !payload.email_verified) {
        throw new Error("Correo de Google no verificado");
    }

    return {
        correo: payload.email,
        nombre: payload.given_name ?? "",
        apellido: payload.family_name ?? "",
    };
}

export const login = async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return handleErrorClient(res, 400, "El correo electrónico y la contraseña son obligatorios.");
    }

    try {
        const resultado = await loginUser(correo, password);
        return handleSuccess(res, 200, "Inicio de sesión exitoso.", resultado);

    } catch (error) {
        if (error.message === "Credenciales incorrectas") {
            return handleErrorClient(res, 401, "El correo electrónico o la contraseña son incorrectos.");
        }
        return handleErrorServer(res, 500, "Hubo un problema en el servidor al intentar iniciar sesión.", error.message);
    }
};
export const loginGoogle = async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return handleErrorClient(res, 400, "Falta el token de Google.");
    }

    let datos;
    try {
        datos = await verificarGoogle(credential);
    } catch (error) {
        return handleErrorClient(res, 401, "Token de Google inválido o correo no verificado.");
    }

    try {
        const resultado = await loginUserConGoogle(datos.correo);
        return handleSuccess(res, 200, "Inicio de sesión exitoso.", resultado);
    } catch (error) {
        if (error.message === "Usuario no registrado") {
            return handleSuccess(res, 200, "Falta completar el registro.", {
                registroPendiente: true,
                correo: datos.correo,
                nombre: datos.nombre,
                apellido: datos.apellido,
            });
        }
        return handleErrorServer(res, 500, "Hubo un problema en el servidor al intentar iniciar sesión.", error.message);
    }
};

export const registroGoogle = async (req, res) => {
    const {
        credential, nombre, apellido, rut, telefono, password,
        fecha_nacimiento, direccion, ocupacion, enfermedades, medicamentos,
    } = req.body;

    if (!credential || !nombre || !apellido || !rut || !telefono || !password || !fecha_nacimiento || !direccion || !ocupacion) {
        return handleErrorClient(res, 400, "Faltan datos obligatorios.");
    }

    const rutLimpio = String(rut).trim();
    const telefonoLimpio = String(telefono).trim();

    if (!rut_val.test(rutLimpio)) {
        return handleErrorClient(res, 400, "El RUT debe tener el formato xx.xxx.xxx-x.");
    }
    if (!telefono_val.test(telefonoLimpio)) {
        return handleErrorClient(res, 400, "El teléfono no es válido.");
    }
    if (!password_val.test(String(password))) {
        return handleErrorClient(res, 400, "La contraseña debe tener entre 8 y 30 caracteres y al menos un número.");
    }

    let datos;
    try {
        datos = await verificarGoogle(credential);
    } catch (error) {
        return handleErrorClient(res, 401, "Token de Google inválido o correo no verificado.");
    }

    try {
        const existente = await prisma.usuario.findFirst({
            where: {
                OR: [
                    { rut: rutLimpio },
                    { correo: datos.correo },
                    { telefono: telefonoLimpio },
                ],
            },
        });

        if (existente) {
            if (existente.rut === rutLimpio) return handleErrorClient(res, 400, "Ya existe este RUT.");
            if (existente.correo === datos.correo) return handleErrorClient(res, 400, "Ya existe este correo.");
            if (existente.telefono === telefonoLimpio) return handleErrorClient(res, 400, "Ya existe este teléfono.");
        }

        const hashedPassword = await encryptPassword(String(password));

        const resultado = await registerUserConGoogle({
            correo: datos.correo,
            nombre, apellido,
            rut: rutLimpio,
            telefono: telefonoLimpio,
            password: hashedPassword,
            fecha_nacimiento,
            direccion, ocupacion, enfermedades, medicamentos,
        });
        return handleSuccess(res, 201, "Cuenta creada con éxito.", resultado);
    } catch (error) {
        if (error.code === "P2002") {
            return handleErrorClient(res, 409, "Ya existe una cuenta con ese RUT, correo o teléfono.");
        }
        return handleErrorServer(res, 500, "Error al registrar la cuenta.", error.message);
    }
};

export const verificarDisponibilidad = async (req, res) => {
    const rut = String(req.query.rut ?? "").trim();
    const telefono = String(req.query.telefono ?? "").trim();
    const correo = String(req.query.correo ?? "").trim();

    const filtros = [];

    if (rut) {
        if (!rut_val.test(rut)) {
            return handleErrorClient(res, 400, "El RUT debe tener el formato xx.xxx.xxx-x.");
        }
        filtros.push({ rut });
    }
    if (telefono) {
        if (!telefono_val.test(telefono)) {
            return handleErrorClient(res, 400, "El teléfono no es válido.");
        }
        filtros.push({ telefono });
    }
    if (correo) {
        filtros.push({ correo });
    }

    if (filtros.length === 0) {
        return handleErrorClient(res, 400, "Indica un RUT, teléfono o correo para verificar.");
    }

    try {
        const existente = await prisma.usuario.findFirst({
            where: { OR: filtros },
            select: { rut: true, telefono: true, correo: true },
        });

        let motivo = null;
        if (existente) {
            if (rut && existente.rut === rut) motivo = "Ya existe este RUT.";
            else if (correo && existente.correo === correo) motivo = "Ya existe este correo.";
            else if (telefono && existente.telefono === telefono) motivo = "Ya existe este teléfono.";
        }

        return handleSuccess(res, 200, "Verificación realizada.", {
            disponible: !motivo,
            motivo,
        });
    } catch (error) {
        return handleErrorServer(res, 500, "Error al verificar los datos.", error.message);
    }
};