import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";

// RNF-13: mensajes comprensibles ante errores y operaciones exitosas.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: "Datos invalidos.",
      detalles: err.issues.map((issue) => ({ campo: issue.path.join("."), mensaje: issue.message })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: "Ocurrio un error inesperado. Intenta nuevamente." });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Ruta no encontrada." });
}
