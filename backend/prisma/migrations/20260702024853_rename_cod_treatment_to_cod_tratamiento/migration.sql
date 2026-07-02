/*
  Warnings:

  - Added the required column `id_profesional` to the `tratamientos_asignados` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tratamientos_asignados" ADD COLUMN     "id_profesional" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "rol" SET DEFAULT 'paciente';

-- AddForeignKey
ALTER TABLE "tratamientos_asignados" ADD CONSTRAINT "tratamientos_asignados_id_profesional_fkey" FOREIGN KEY ("id_profesional") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
