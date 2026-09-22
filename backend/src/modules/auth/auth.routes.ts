import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import {
  loginController,
  meController,
  actualizarPerfilController,
  cambiarPasswordController,
} from "./auth.controller";

const router = Router();

// Limita intentos de fuerza bruta sobre el login (RNF-02 / OWASP).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta nuevamente en unos minutos." },
});

// Misma proteccion para el cambio de contrasena (requiere adivinar la actual).
const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta nuevamente en unos minutos." },
});

router.post("/login", loginLimiter, asyncHandler(loginController));
router.get("/me", requireAuth, asyncHandler(meController));
router.patch("/me", requireAuth, asyncHandler(actualizarPerfilController));
router.patch("/me/password", requireAuth, passwordLimiter, asyncHandler(cambiarPasswordController));

export default router;
