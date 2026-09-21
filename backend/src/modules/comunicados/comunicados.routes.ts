import { Router } from "express";
import { Rol } from "@prisma/client";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as controller from "./comunicados.controller";

const router = Router();

router.use(requireAuth);

router.post("/", requireRole(Rol.ADMIN), asyncHandler(controller.crearComunicadoController));
router.get("/", asyncHandler(controller.listarComunicadosController));

export default router;
