-- AlterEnum
-- Se elimina el valor RECIBIDA: el servicio siempre crea la encomienda ya en
-- estado NOTIFICADA (HU-13 notifica al residente automaticamente al registrar),
-- por lo que RECIBIDA nunca llegaba a usarse en la practica.
BEGIN;
CREATE TYPE "EstadoEncomienda_new" AS ENUM ('NOTIFICADA', 'RETIRADA');
ALTER TABLE "encomiendas" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "encomiendas" ALTER COLUMN "estado" TYPE "EstadoEncomienda_new" USING ("estado"::text::"EstadoEncomienda_new");
ALTER TYPE "EstadoEncomienda" RENAME TO "EstadoEncomienda_old";
ALTER TYPE "EstadoEncomienda_new" RENAME TO "EstadoEncomienda";
DROP TYPE "EstadoEncomienda_old";
ALTER TABLE "encomiendas" ALTER COLUMN "estado" SET DEFAULT 'NOTIFICADA';
COMMIT;
