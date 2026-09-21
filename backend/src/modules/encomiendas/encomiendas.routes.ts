import { Router } from "express";
import { Rol } from "@prisma/client";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as controller from "./encomiendas.controller";

const router = Router();

router.use(requireAuth);

router.post("/", requireRole(Rol.CONSERJE), asyncHandler(controller.crearEncomiendaController));
router.get("/mias", requireRole(Rol.RESIDENTE), asyncHandler(controller.misEncomiendasController));
router.get("/", requireRole(Rol.ADMIN, Rol.CONSERJE), asyncHandler(controller.listarEncomiendasController));
router.patch(
  "/:id/retirar",
  requireRole(Rol.CONSERJE),
  asyncHandler(controller.marcarRetiradaController)
);

export default router;
