import { Request, Response } from "express";
import { suscripcionSchema, eliminarSuscripcionSchema } from "./push.schema";
import * as service from "./push.service";

export async function vapidPublicKeyController(_req: Request, res: Response) {
  res.json({ publicKey: service.obtenerVapidPublicKey() });
}

export async function suscribirController(req: Request, res: Response) {
  const suscripcion = suscripcionSchema.parse(req.body);
  await service.guardarSuscripcion(req.auth!.sub, suscripcion);
  res.status(204).send();
}

export async function eliminarSuscripcionController(req: Request, res: Response) {
  const { endpoint } = eliminarSuscripcionSchema.parse(req.body);
  await service.eliminarSuscripcion(req.auth!.sub, endpoint);
  res.status(204).send();
}
