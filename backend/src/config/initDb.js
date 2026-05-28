"use strict";

import { encryptPassword } from "../handlers/bcrypt.helper.js";
import { prisma } from "../config/configDb.js"; // Importamos el cliente de Prisma que creamos antes

export async function createusers(){
    try {
        // En Prisma no hay repositorios, contamos directamente sobre el modelo
        const usersCount = await prisma.usuario.count();

        if (usersCount > 0) return;
        
        const users = [
            {
                rut: "12.345.678-9",
                nombre: "Administrador",
                apellido: "Sistema",
                email: "admin@gmail.com",
                rol: "Administrador",
                telefono: "+56912345678",
                password: await encryptPassword("admin123"),
            },
        ];

        console.log("Inicializando usuarios por defecto...");
        
        for (const userData of users) {
            // Prisma no necesita el paso intermedio ".create()" seguido de ".save()"
            // El método .create() de Prisma guarda el registro directamente en la base de datos
            await prisma.usuario.create({
                data: userData
            });
        }
        
        console.log("Usuarios por defecto inicializados.");

    } catch (error) {
        console.error("Error al inicializar usuarios por defecto:", error);
        process.exit(1);
    }
}