import { z } from "zod";

export const crearVisitaSchema = z
  .object({
    nombreVisita: z.string().min(1, "El nombre de la visita es obligatorio."),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha invalido (YYYY-MM-DD)."),
    periodoInicio: z.string().datetime({ message: "periodoInicio debe ser una fecha/hora ISO valida." }),
    periodoFin: z.string().datetime({ message: "periodoFin debe ser una fecha/hora ISO valida." }),
    observaciones: z.string().optional(),
    soloUnUso: z.boolean().default(false),
  })
  .refine((data) => new Date(data.periodoInicio) < new Date(data.periodoFin), {
    message: "El periodo de autorizacion debe terminar despues de comenzar.",
    path: ["periodoFin"],
  });

export const validarQrSchema = z.object({
  token: z.string().min(1, "El token QR es obligatorio."),
});
