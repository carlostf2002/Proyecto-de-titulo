-- CreateEnum
CREATE TYPE "TipoEmergenciaSos" AS ENUM ('CARABINEROS', 'BOMBEROS', 'AMBULANCIA');

-- CreateTable
CREATE TABLE "alertas_sos" (
    "id" TEXT NOT NULL,
    "condominioId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoEmergenciaSos" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_sos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alertas_sos_condominioId_createdAt_idx" ON "alertas_sos"("condominioId", "createdAt");

-- AddForeignKey
ALTER TABLE "alertas_sos" ADD CONSTRAINT "alertas_sos_condominioId_fkey" FOREIGN KEY ("condominioId") REFERENCES "condominios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_sos" ADD CONSTRAINT "alertas_sos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
