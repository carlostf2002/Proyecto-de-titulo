import { z } from "zod";
import { TipoEmergenciaSos } from "@prisma/client";

export const crearAlertaSosSchema = z.object({
  tipo: z.nativeEnum(TipoEmergenciaSos),
});
