import { Router } from "express";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import * as controller from "./push.controller";

const router = Router();

// Publica (sin login): el frontend la necesita antes de autenticar, para
// armar la suscripcion con pushManager.subscribe(). La clave publica no es
// secreta por diseño (va embebida en cada suscripcion que crea el navegador).
router.get("/vapid-public-key", asyncHandler(controller.vapidPublicKeyController));

router.use(requireAuth);
router.post("/suscribir", asyncHandler(controller.suscribirController));
router.delete("/suscribir", asyncHandler(controller.eliminarSuscripcionController));

export default router;
