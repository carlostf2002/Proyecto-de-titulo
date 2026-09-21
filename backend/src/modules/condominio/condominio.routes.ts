import { Router } from "express";
import { Rol } from "@prisma/client";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as controller from "./condominio.controller";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(controller.obtenerCondominioController));
router.patch("/", requireRole(Rol.ADMIN), asyncHandler(controller.actualizarCondominioController));

router.get("/torres", requireRole(Rol.ADMIN), asyncHandler(controller.listarTorresController));
router.post("/torres", requireRole(Rol.ADMIN), asyncHandler(controller.crearTorreController));

router.get("/departamentos", requireRole(Rol.ADMIN), asyncHandler(controller.listarDepartamentosController));
router.post("/departamentos", requireRole(Rol.ADMIN), asyncHandler(controller.crearDepartamentoController));

// Los residentes necesitan consultar espacios comunes para reservar (HU-04).
router.get("/espacios-comunes", asyncHandler(controller.listarEspaciosComunesController));
router.post("/espacios-comunes", requireRole(Rol.ADMIN), asyncHandler(controller.crearEspacioComunController));
router.patch(
  "/espacios-comunes/:id",
  requireRole(Rol.ADMIN),
  asyncHandler(controller.actualizarEspacioComunController)
);

export default router;
