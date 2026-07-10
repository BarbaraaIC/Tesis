import { PrismaClient } from '@prisma/client';
import { encryptPassword } from '../src/handlers/bcrypt.helper.js';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await encryptPassword(adminPassword);

  await prisma.usuario.upsert({
    where: { correo: adminEmail },
    update: {},
    create: {
      rut: '12.345.678-9',
      nombre: 'Administrador',
      apellido: 'Sistema',
      edad: 30,
      direccion: 'Dirección por defecto',
      telefono: '+56912345678',
      correo: adminEmail,
      password: passwordHash,
      rol: 'administrador',
      ocupacion: 'Administrador',
    },
  });

  console.log('Admin user seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
