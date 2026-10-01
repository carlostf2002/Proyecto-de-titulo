import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa backend/.env (usa .env.example como base).`);
  }
  return value;
}

const port = Number(process.env.PORT ?? 4000);

export const env = {
  port,
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
  qrTokenSecret: required("QR_TOKEN_SECRET"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  // Base publica de la app (mismo origen que sirve frontend+API). Se usa para
  // que el QR codifique un link real (https://.../acceso/<token>) en vez de
  // solo el token en texto plano -- asi cualquier camara de celular puede
  // abrirlo, no solo el escaner propio de la app.
  appUrl: process.env.APP_URL ?? `http://localhost:${port}`,
  isProd: process.env.NODE_ENV === "production",
  // Web Push: si faltan, el modulo push queda deshabilitado en silencio (ver
  // push.service.ts) en vez de tumbar el servidor -- es una funcionalidad
  // adicional (notificaciones aunque la app este cerrada), no el nucleo de
  // la app, asi que no deberia impedir levantar el backend si alguien
  // todavia no genero sus propias claves VAPID.
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
  vapidSubject: process.env.VAPID_SUBJECT ?? "mailto:soporte@habitasmart.cl",
};
