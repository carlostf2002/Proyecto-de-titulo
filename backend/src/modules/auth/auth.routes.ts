import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../../lib/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { loginController, meController } from "./auth.controller";

const router = Router();

// Limita intentos de fuerza bruta sobre el login (RNF-02 / OWASP).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Intenta nuevamente en unos minutos." },
});

router.post("/login", loginLimiter, asyncHandler(loginController));
router.get("/me", requireAuth, asyncHandler(meController));

export default router;
