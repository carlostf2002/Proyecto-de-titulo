import { Request, Response } from "express";
import { crearAlertaSosSchema } from "./sos.schema";
import * as service from "./sos.service";

export async function crearAlertaController(req: Request, res: Response) {
  const { tipo } = crearAlertaSosSchema.parse(req.body);
  const alerta = await service.crearAlerta(req.auth!.condominioId, req.auth!.sub, tipo);
  res.status(201).json(alerta);
}

export async function listarAlertasController(req: Request, res: Response) {
  res.json(await service.listarAlertas(req.auth!.condominioId));
}
