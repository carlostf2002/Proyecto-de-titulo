import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { UPLOADS_DIR } from "./middleware/upload";

import authRoutes from "./modules/auth/auth.routes";
import usuariosRoutes from "./modules/usuarios/usuarios.routes";
import condominioRoutes from "./modules/condominio/condominio.routes";
import reservasRoutes from "./modules/reservas/reservas.routes";
import multasRoutes from "./modules/multas/multas.routes";
import incidenciasRoutes from "./modules/incidencias/incidencias.routes";
import encomiendasRoutes from "./modules/encomiendas/encomiendas.routes";
import comunicadosRoutes from "./modules/comunicados/comunicados.routes";
import qrRoutes from "./modules/qr/qr.routes";
import documentosRoutes from "./modules/documentos/documentos.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import notificacionesRoutes from "./modules/notificaciones/notificaciones.routes";

export const app = express();

// RNF-03/RNF-05: cabeceras de seguridad y validacion de entradas en el backend.
app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan(env.isProd ? "combined" : "dev"));
app.use("/uploads", express.static(UPLOADS_DIR));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/condominio", condominioRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/multas", multasRoutes);
app.use("/api/incidencias", incidenciasRoutes);
app.use("/api/encomiendas", encomiendasRoutes);
app.use("/api/comunicados", comunicadosRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/documentos", documentosRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notificaciones", notificacionesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
