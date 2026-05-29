import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

const adapter = new PrismaPg(pool);


export const prisma = new PrismaClient({ adapter });

export async function connectDB() {
    try {
        await prisma.$connect();
        console.log("=> Conexión exitosa a la base de datos!");
    } catch (error) {
        console.error("Error al conectar con la base de datos:", error);
        process.exit(1);
    }
}