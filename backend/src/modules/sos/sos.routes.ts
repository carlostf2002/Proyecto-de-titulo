import { Router } from "express";
import { Rol } from "@prisma/client";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as controller from "./sos.controller";

const router = Router();

router.use(requireAuth);

router.post("/", requireRole(Rol.RESIDENTE), asyncHandler(controller.crearAlertaController));
router.get("/", requireRole(Rol.ADMIN, Rol.CONSERJE), asyncHandler(controller.listarAlertasController));

export default router;
