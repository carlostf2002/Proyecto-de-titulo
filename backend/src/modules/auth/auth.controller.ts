import { Request, Response } from "express";
import { loginSchema } from "./auth.schema";
import { login, getPerfil } from "./auth.service";

export async function loginController(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);
  const resultado = await login(email, password);
  res.json(resultado);
}

export async function meController(req: Request, res: Response) {
  const usuario = await getPerfil(req.auth!.sub);
  res.json(usuario);
}
