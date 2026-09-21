import { Router } from "express";
import { Rol } from "@prisma/client";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import { indicadoresController } from "./dashboard.controller";

const router = Router();

router.get("/", requireAuth, requireRole(Rol.ADMIN), asyncHandler(indicadoresController));

export default router;
