import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Ingresa un correo valido."),
  password: z.string().min(1, "La contrasena es obligatoria."),
});
