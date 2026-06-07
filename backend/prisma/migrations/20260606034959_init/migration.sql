-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "rut" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "edad" INTEGER NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "enfermedades" TEXT,
    "medicamentos" TEXT,
    "ocupacion" TEXT NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "servicios" (
    "id_servicio" SERIAL NOT NULL,
    "tipo_servicio" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "servicios_pkey" PRIMARY KEY ("id_servicio")
);

-- CreateTable
CREATE TABLE "tratamientos" (
    "cod_tratamiento" SERIAL NOT NULL,
    "costo" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "id_servicio" INTEGER NOT NULL,

    CONSTRAINT "tratamientos_pkey" PRIMARY KEY ("cod_tratamiento")
);

-- CreateTable
CREATE TABLE "tratamientos_asignados" (
    "id_asignacion" SERIAL NOT NULL,
    "fecha_asignacion" DATE NOT NULL,
    "estado_actual" TEXT NOT NULL,
    "observaciones" TEXT,
    "id_usuario" INTEGER NOT NULL,
    "cod_tratamiento" INTEGER NOT NULL,

    CONSTRAINT "tratamientos_asignados_pkey" PRIMARY KEY ("id_asignacion")
);

-- CreateTable
CREATE TABLE "reservas" (
    "cod_reserva" SERIAL NOT NULL,
    "dia" DATE NOT NULL,
    "hora" TIME(0) NOT NULL,
    "tiempo_estimado" TIME(0) NOT NULL,
    "id_asignacion" INTEGER NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("cod_reserva")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_rut_key" ON "usuarios"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- AddForeignKey
ALTER TABLE "tratamientos" ADD CONSTRAINT "tratamientos_id_servicio_fkey" FOREIGN KEY ("id_servicio") REFERENCES "servicios"("id_servicio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tratamientos_asignados" ADD CONSTRAINT "tratamientos_asignados_cod_tratamiento_fkey" FOREIGN KEY ("cod_tratamiento") REFERENCES "tratamientos"("cod_tratamiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tratamientos_asignados" ADD CONSTRAINT "tratamientos_asignados_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_id_asignacion_fkey" FOREIGN KEY ("id_asignacion") REFERENCES "tratamientos_asignados"("id_asignacion") ON DELETE RESTRICT ON UPDATE CASCADE;
