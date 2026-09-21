import { Router } from "express";
import { Rol } from "@prisma/client";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import { upload } from "../../middleware/upload";
import * as controller from "./incidencias.controller";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  requireRole(Rol.RESIDENTE),
  upload.single("foto"),
  asyncHandler(controller.crearIncidenciaController)
);
router.get("/mias", requireRole(Rol.RESIDENTE), asyncHandler(controller.misIncidenciasController));
router.get("/", requireRole(Rol.ADMIN), asyncHandler(controller.listarIncidenciasController));
router.get("/:id", asyncHandler(controller.obtenerIncidenciaController));
router.patch("/:id", requireRole(Rol.ADMIN), asyncHandler(controller.actualizarIncidenciaController));

export default router;
