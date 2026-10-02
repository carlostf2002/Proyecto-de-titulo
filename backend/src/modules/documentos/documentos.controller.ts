import { Request, Response } from "express";
import { crearDocumentoSchema } from "./documentos.schema";
import * as service from "./documentos.service";
import { AppError } from "../../lib/errors";

export async function crearDocumentoController(req: Request, res: Response) {
  const data = crearDocumentoSchema.parse(req.body);
  if (!req.file) {
    throw new AppError("Debes adjuntar un archivo.", 422);
  }
  const archivoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  const documento = await service.crearDocumento(req.auth!.condominioId, req.auth!.sub, {
    ...data,
    archivoUrl,
  });
  res.status(201).json(documento);
}

export async function listarDocumentosController(req: Request, res: Response) {
  res.json(await service.listarDocumentos(req.auth!.condominioId));
}

export async function eliminarDocumentoController(req: Request, res: Response) {
  await service.eliminarDocumento(req.auth!.condominioId, req.params.id);
  res.status(204).send();
}
