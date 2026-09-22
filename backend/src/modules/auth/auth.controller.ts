import { Request, Response } from "express";
import { loginSchema, actualizarPerfilSchema, cambiarPasswordSchema } from "./auth.schema";
import { login, getPerfil, actualizarPerfil, cambiarPassword } from "./auth.service";

export async function loginController(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);
  const resultado = await login(email, password);
  res.json(resultado);
}

export async function meController(req: Request, res: Response) {
  const usuario = await getPerfil(req.auth!.sub);
  res.json(usuario);
}

export async function actualizarPerfilController(req: Request, res: Response) {
  const data = actualizarPerfilSchema.parse(req.body);
  const usuario = await actualizarPerfil(req.auth!.sub, data);
  res.json(usuario);
}

export async function cambiarPasswordController(req: Request, res: Response) {
  const { actual, nueva } = cambiarPasswordSchema.parse(req.body);
  await cambiarPassword(req.auth!.sub, actual, nueva);
  res.status(204).send();
}
