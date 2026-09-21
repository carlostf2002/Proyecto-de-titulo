import { Request, Response } from "express";
import {
  actualizarCondominioSchema,
  crearTorreSchema,
  crearDepartamentoSchema,
  crearEspacioComunSchema,
  actualizarEspacioComunSchema,
} from "./condominio.schema";
import * as condominioService from "./condominio.service";

export async function obtenerCondominioController(req: Request, res: Response) {
  res.json(await condominioService.obtenerCondominio(req.auth!.condominioId));
}

export async function actualizarCondominioController(req: Request, res: Response) {
  const data = actualizarCondominioSchema.parse(req.body);
  res.json(await condominioService.actualizarCondominio(req.auth!.condominioId, data));
}

export async function crearTorreController(req: Request, res: Response) {
  const { nombre } = crearTorreSchema.parse(req.body);
  res.status(201).json(await condominioService.crearTorre(req.auth!.condominioId, nombre));
}

export async function listarTorresController(req: Request, res: Response) {
  res.json(await condominioService.listarTorres(req.auth!.condominioId));
}

export async function crearDepartamentoController(req: Request, res: Response) {
  const data = crearDepartamentoSchema.parse(req.body);
  res.status(201).json(await condominioService.crearDepartamento(req.auth!.condominioId, data));
}

export async function listarDepartamentosController(req: Request, res: Response) {
  res.json(await condominioService.listarDepartamentos(req.auth!.condominioId));
}

export async function crearEspacioComunController(req: Request, res: Response) {
  const data = crearEspacioComunSchema.parse(req.body);
  res.status(201).json(await condominioService.crearEspacioComun(req.auth!.condominioId, data));
}

export async function listarEspaciosComunesController(req: Request, res: Response) {
  const soloActivos = req.query.activos === "true";
  res.json(await condominioService.listarEspaciosComunes(req.auth!.condominioId, soloActivos));
}

export async function actualizarEspacioComunController(req: Request, res: Response) {
  const data = actualizarEspacioComunSchema.parse(req.body);
  res.json(await condominioService.actualizarEspacioComun(req.auth!.condominioId, req.params.id, data));
}
