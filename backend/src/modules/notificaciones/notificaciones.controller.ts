import { Request, Response } from "express";
import * as service from "./notificaciones.service";

export async function listarController(req: Request, res: Response) {
  res.json(await service.listarNotificaciones(req.auth!.sub));
}

export async function marcarLeidaController(req: Request, res: Response) {
  await service.marcarLeida(req.auth!.sub, req.params.id);
  res.status(204).send();
}

export async function marcarTodasLeidasController(req: Request, res: Response) {
  await service.marcarTodasLeidas(req.auth!.sub);
  res.status(204).send();
}
