"use strict";
import { OAuth2Client } from "google-auth-library";
import {loginUser,loginUserConGoogle,registerUserConGoogle} from "../services/auth.service.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";

const clienteGoogle = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const rut_val = /^\d{1,2}\.\d{3}\.\d{3}-[0-9kK]{1}$/;
const telefono_val = /^(?:\+?56)?9[0-9]{8}$/;

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
        credential, nombre, apellido, rut, telefono,
        fecha_nacimiento, direccion, ocupacion, enfermedades, medicamentos,
    } = req.body;

    if (!credential || !nombre || !apellido || !rut || !telefono || !fecha_nacimiento || !direccion || !ocupacion) {
        return handleErrorClient(res, 400, "Faltan datos obligatorios.");
    }

    if (!rut_val.test(String(rut).trim())) {
        return handleErrorClient(res, 400, "El RUT debe tener el formato xx.xxx.xxx-x.");
    }
    if (!telefono_val.test(String(telefono).trim())) {
        return handleErrorClient(res, 400, "El teléfono no es válido.");
    }

    let datos;
    try {
        datos = await verificarGoogle(credential);
    } catch (error) {
        return handleErrorClient(res, 401, "Token de Google inválido o correo no verificado.");
    }

    try {
        const resultado = await registerUserConGoogle({
            correo: datos.correo,
            nombre, apellido, rut, telefono, fecha_nacimiento,
            direccion, ocupacion, enfermedades, medicamentos,
        });
        return handleSuccess(res, 201, "Cuenta creada con éxito.", resultado);
    } catch (error) {
        if (error.code === "P2002") {
            return handleErrorClient(res, 409, "Ya existe una cuenta con ese RUT o correo.");
        }
        return handleErrorServer(res, 500, "Error al registrar la cuenta.", error.message);
    }
};