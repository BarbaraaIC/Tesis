-- CreateEnum
CREATE TYPE "estado_asistencia" AS ENUM ('pendiente', 'asistio', 'no_asistio');

-- AlterTable
ALTER TABLE "reservas" ADD COLUMN     "asistencia" "estado_asistencia" NOT NULL DEFAULT 'pendiente',
ADD COLUMN     "recordatorio_enviado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "servicios" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "tratamientos" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable (fecha_nacimiento: default temporal para filas existentes)
ALTER TABLE "usuarios" DROP COLUMN "edad",
ADD COLUMN     "autoriza_datos_salud" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fecha_nacimiento" TIMESTAMP(3) NOT NULL DEFAULT '2000-01-01';
ALTER TABLE "usuarios" ALTER COLUMN "fecha_nacimiento" DROP DEFAULT;
