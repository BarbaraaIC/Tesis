"use strict";
import { loginUser } from "../services/auth.service.js";
import { handleSuccess, handleErrorServer, handleErrorClient } from "../handlers/responseHandlers.js";

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