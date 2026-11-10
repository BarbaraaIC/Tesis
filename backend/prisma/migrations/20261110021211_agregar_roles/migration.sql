/*
  Warnings:

  - You are about to drop the column `edad` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `rol` on the `usuarios` table. All the data in the column will be lost.
  - Added the required column `fecha_nacimiento` to the `usuarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_rol` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "estado_asistencia" AS ENUM ('pendiente', 'asistio', 'no_asistio');

-- AlterTable
ALTER TABLE "reservas" ADD COLUMN     "asistencia" "estado_asistencia" NOT NULL DEFAULT 'pendiente',
ADD COLUMN     "recordatorio_enviado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "servicios" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "tratamientos" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "edad",
DROP COLUMN "rol",
ADD COLUMN     "autoriza_datos_salud" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "id_rol" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "roles" (
    "id_rol" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_rol")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;
