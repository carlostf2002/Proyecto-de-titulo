import { Request, Response } from "express";
import { crearComunicadoSchema } from "./comunicados.schema";
import * as service from "./comunicados.service";

export async function crearComunicadoController(req: Request, res: Response) {
  const data = crearComunicadoSchema.parse(req.body);
  const comunicado = await service.crearComunicado(req.auth!.condominioId, req.auth!.sub, data);
  res.status(201).json(comunicado);
}

export async function listarComunicadosController(req: Request, res: Response) {
  res.json(await service.listarComunicados(req.auth!.condominioId));
}
