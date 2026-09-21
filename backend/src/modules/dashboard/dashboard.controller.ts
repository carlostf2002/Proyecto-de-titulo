import { Request, Response } from "express";
import { obtenerIndicadores } from "./dashboard.service";

export async function indicadoresController(req: Request, res: Response) {
  res.json(await obtenerIndicadores(req.auth!.condominioId));
}
