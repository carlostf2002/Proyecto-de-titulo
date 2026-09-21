import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import * as controller from "./notificaciones.controller";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(controller.listarController));
router.patch("/leer-todas", asyncHandler(controller.marcarTodasLeidasController));
router.patch("/:id/leer", asyncHandler(controller.marcarLeidaController));

export default router;
