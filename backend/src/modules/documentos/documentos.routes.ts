import { Router } from "express";
import { Rol } from "@prisma/client";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import { uploadArchivoMemoria } from "../../middleware/upload";
import * as controller from "./documentos.controller";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  requireRole(Rol.ADMIN),
  uploadArchivoMemoria.single("archivo"),
  asyncHandler(controller.crearDocumentoController)
);
router.get("/", asyncHandler(controller.listarDocumentosController));

export default router;
