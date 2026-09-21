import { z } from "zod";

const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const crearReservaSchema = z
  .object({
    espacioComunId: z.string().uuid(),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha invalido (YYYY-MM-DD)."),
    horaInicio: z.string().regex(horaRegex, "Formato de hora invalido (HH:mm)."),
    horaFin: z.string().regex(horaRegex, "Formato de hora invalido (HH:mm)."),
  })
  .refine((data) => data.horaInicio < data.horaFin, {
    message: "La hora de termino debe ser posterior a la hora de inicio.",
    path: ["horaFin"],
  });

export const disponibilidadQuerySchema = z.object({
  espacioComunId: z.string().uuid(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha invalido (YYYY-MM-DD)."),
});
