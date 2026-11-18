-- CreateTable
CREATE TABLE "roles" (
    "id_rol" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_rol")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- Roles base (necesarios para migrar los usuarios existentes)
INSERT INTO "roles" ("nombre") VALUES ('paciente'), ('profesional'), ('administrador');

-- id_rol nullable primero, se rellena desde el texto "rol"
ALTER TABLE "usuarios" ADD COLUMN "id_rol" INTEGER;

UPDATE "usuarios" u
SET "id_rol" = r."id_rol"
FROM "roles" r
WHERE r."nombre" = u."rol";

-- Cualquier valor desconocido queda como paciente
UPDATE "usuarios"
SET "id_rol" = (SELECT "id_rol" FROM "roles" WHERE "nombre" = 'paciente')
WHERE "id_rol" IS NULL;

ALTER TABLE "usuarios" ALTER COLUMN "id_rol" SET NOT NULL;
ALTER TABLE "usuarios" DROP COLUMN "rol";

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id_rol") ON DELETE RESTRICT ON UPDATE CASCADE;
