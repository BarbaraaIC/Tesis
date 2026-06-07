"use strict";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Busca al usuario en la BD y lo retorna con todo (incluyendo la contraseña)
export const findUserByEmail = async (correo) => {
    return await prisma.usuario.findUnique({
        where: { correo: correo }
    });
};