import { z } from "zod";
import { EstadoEncomienda } from "@prisma/client";

export const crearEncomiendaSchema = z.object({
  usuarioId: z.string().uuid(),
  remitente: z.string().optional(),
});

export const listarEncomiendasQuerySchema = z.object({
  estado: z.nativeEnum(EstadoEncomienda).optional(),
});
