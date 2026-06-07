"use strict";

import jwt from "jsonwebtoken";
import { comparePassword } from "../handlers/bcrypt.helper.js";
import { findUserByEmail } from "./user.service.js";

export const loginUser = async (correo, password) => {
    const usuario = await findUserByEmail(correo);

    if (!usuario) {
        throw new Error("Credenciales incorrectas");
    }
    const isMatch = await comparePassword(password, usuario.password);
    if (!isMatch) {
        throw new Error("Credenciales incorrectas");
    }

    const payload = {
        sub: usuario.rut,      
        correo: usuario.correo,
        rol: usuario.rol || "paciente",
    };

    const secretKey = process.env.JWT_SECRET || "clave_secreta_por_defecto_tesis";
    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });

    delete usuario.password; 

    return { 
        user: usuario, 
        token 
    };
};