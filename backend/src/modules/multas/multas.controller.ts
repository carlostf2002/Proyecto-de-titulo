import { Request, Response } from "express";
import { crearMultaSchema, actualizarMultaSchema, listarMultasQuerySchema } from "./multas.schema";
import * as service from "./multas.service";

export async function crearMultaController(req: Request, res: Response) {
  const data = crearMultaSchema.parse(req.body);
  const multa = await service.crearMulta(req.auth!.condominioId, req.auth!.sub, data);
  res.status(201).json(multa);
}

export async function misMultasController(req: Request, res: Response) {
  res.json(await service.listarMisMultas(req.auth!.sub));
}

export async function listarMultasController(req: Request, res: Response) {
  const filtros = listarMultasQuerySchema.parse(req.query);
  res.json(await service.listarMultasCondominio(req.auth!.condominioId, filtros));
}

export async function actualizarMultaController(req: Request, res: Response) {
  const data = actualizarMultaSchema.parse(req.body);
  res.json(await service.actualizarMulta(req.auth!.condominioId, req.params.id, data));
}
