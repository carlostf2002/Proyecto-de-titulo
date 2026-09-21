import { Request, Response } from "express";
import { Rol } from "@prisma/client";
import {
  crearIncidenciaSchema,
  actualizarIncidenciaSchema,
  listarIncidenciasQuerySchema,
} from "./incidencias.schema";
import * as service from "./incidencias.service";
import { archivoUrl } from "../../middleware/upload";
import { ForbiddenError } from "../../lib/errors";

export async function crearIncidenciaController(req: Request, res: Response) {
  const data = crearIncidenciaSchema.parse(req.body);
  const fotoUrl = req.file ? archivoUrl(req.file.filename) : undefined;
  const incidencia = await service.crearIncidencia(req.auth!.condominioId, req.auth!.sub, {
    ...data,
    fotoUrl,
  });
  res.status(201).json(incidencia);
}

export async function misIncidenciasController(req: Request, res: Response) {
  res.json(await service.listarMisIncidencias(req.auth!.sub));
}

export async function listarIncidenciasController(req: Request, res: Response) {
  const filtros = listarIncidenciasQuerySchema.parse(req.query);
  res.json(await service.listarIncidenciasCondominio(req.auth!.condominioId, filtros));
}

export async function obtenerIncidenciaController(req: Request, res: Response) {
  const incidencia = await service.obtenerIncidencia(req.auth!.condominioId, req.params.id);
  if (req.auth!.rol === Rol.RESIDENTE && incidencia.usuarioId !== req.auth!.sub) {
    throw new ForbiddenError("Solo puedes consultar tus propias incidencias.");
  }
  res.json(incidencia);
}

export async function actualizarIncidenciaController(req: Request, res: Response) {
  const data = actualizarIncidenciaSchema.parse(req.body);
  const incidencia = await service.actualizarIncidencia(
    req.auth!.condominioId,
    req.params.id,
    req.auth!.sub,
    data
  );
  res.json(incidencia);
}
