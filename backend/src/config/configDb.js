"use strict";
import { PrismaClient } from "@prisma/client";

// Instanciamos el cliente de Prisma (Este reemplaza a AppDataSource)
export const prisma = new PrismaClient();

export async function connectDB() {
    try {
        // En Prisma, la conexión se inicia automáticamente al hacer la primera consulta,
        // pero podemos forzarla con $connect() para asegurarnos de que Docker está respondiendo.
        await prisma.$connect();
        console.log("=> Conexión exitosa a la base de datos!");
    } catch (error) {
        console.error("Error al conectar con la base de datos:", error);
        process.exit(1);
    }
}