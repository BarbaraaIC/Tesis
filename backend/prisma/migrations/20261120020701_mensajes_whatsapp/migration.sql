-- CreateTable
CREATE TABLE "mensajes_whatsapp" (
    "id_mensaje" SERIAL NOT NULL,
    "cod_reserva" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "wamid" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'enviado',
    "error_codigo" INTEGER,
    "error_mensaje" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entregado_en" TIMESTAMP(3),
    "leido_en" TIMESTAMP(3),

    CONSTRAINT "mensajes_whatsapp_pkey" PRIMARY KEY ("id_mensaje")
);

-- CreateIndex
CREATE UNIQUE INDEX "mensajes_whatsapp_wamid_key" ON "mensajes_whatsapp"("wamid");

-- CreateIndex
CREATE INDEX "mensajes_whatsapp_cod_reserva_idx" ON "mensajes_whatsapp"("cod_reserva");

-- AddForeignKey
ALTER TABLE "mensajes_whatsapp" ADD CONSTRAINT "mensajes_whatsapp_cod_reserva_fkey" FOREIGN KEY ("cod_reserva") REFERENCES "reservas"("cod_reserva") ON DELETE CASCADE ON UPDATE CASCADE;
