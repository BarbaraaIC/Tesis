"use strict";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findUserByEmail = async (correo) => {
    return await prisma.usuario.findUnique({
        where: { correo: correo },
        include: { rol: true },
    });
};