import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

// Cargamos explícitamente las variables del archivo .env
dotenv.config();

export default defineConfig({
  datasource: {
    // Ahora process.env.DATABASE_URL sí tendrá el string de conexión
    url: process.env.DATABASE_URL,
  },
});