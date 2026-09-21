import { Request, Response } from "express";
import { crearDocumentoSchema } from "./documentos.schema";
import * as service from "./documentos.service";
import { archivoUrl } from "../../middleware/upload";
import { AppError } from "../../lib/errors";

export async function crearDocumentoController(req: Request, res: Response) {
  const data = crearDocumentoSchema.parse(req.body);
  if (!req.file) {
    throw new AppError("Debes adjuntar un archivo.", 422);
  }
  const documento = await service.crearDocumento(req.auth!.condominioId, req.auth!.sub, {
    ...data,
    archivoUrl: archivoUrl(req.file.filename),
  });
  res.status(201).json(documento);
}

export async function listarDocumentosController(req: Request, res: Response) {
  res.json(await service.listarDocumentos(req.auth!.condominioId));
}
