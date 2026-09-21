import { Request, Response } from "express";
import {
  crearUsuarioSchema,
  actualizarUsuarioSchema,
  listarUsuariosQuerySchema,
} from "./usuarios.schema";
import { crearUsuario, listarUsuarios, obtenerUsuario, actualizarUsuario } from "./usuarios.service";

export async function crearUsuarioController(req: Request, res: Response) {
  const data = crearUsuarioSchema.parse(req.body);
  const usuario = await crearUsuario(req.auth!.condominioId, data);
  res.status(201).json(usuario);
}

export async function listarUsuariosController(req: Request, res: Response) {
  const filtros = listarUsuariosQuerySchema.parse(req.query);
  const usuarios = await listarUsuarios(req.auth!.condominioId, filtros);
  res.json(usuarios);
}

export async function obtenerUsuarioController(req: Request, res: Response) {
  const usuario = await obtenerUsuario(req.auth!.condominioId, req.params.id);
  res.json(usuario);
}

export async function actualizarUsuarioController(req: Request, res: Response) {
  const data = actualizarUsuarioSchema.parse(req.body);
  const usuario = await actualizarUsuario(req.auth!.condominioId, req.params.id, data);
  res.json(usuario);
}
