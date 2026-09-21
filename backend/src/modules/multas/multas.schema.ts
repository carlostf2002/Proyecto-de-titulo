import { z } from "zod";
import { EstadoMulta } from "@prisma/client";

export const crearMultaSchema = z.object({
  usuarioId: z.string().uuid(),
  motivo: z.string().min(1, "El motivo es obligatorio."),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha invalido (YYYY-MM-DD)."),
  monto: z.number().int().positive("El monto debe ser mayor a cero."),
  observaciones: z.string().optional(),
});

export const actualizarMultaSchema = z.object({
  estado: z.nativeEnum(EstadoMulta).optional(),
  observaciones: z.string().optional(),
});

export const listarMultasQuerySchema = z.object({
  estado: z.nativeEnum(EstadoMulta).optional(),
  usuarioId: z.string().uuid().optional(),
});
