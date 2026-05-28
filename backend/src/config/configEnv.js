"use strict";
import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3000;
// Aquí exportas tokens JWT, claves de APIs, etc.
// Ya no necesitas exportar HOST, DB_PORT, ni contraseñas de la BD aquí.