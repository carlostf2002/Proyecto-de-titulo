import webpush from "web-push";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";

const habilitado = Boolean(env.vapidPublicKey && env.vapidPrivateKey);

if (habilitado) {
  webpush.setVapidDetails(env.vapidSubject, env.vapidPublicKey!, env.vapidPrivateKey!);
}

export function obtenerVapidPublicKey(): string | null {
  return env.vapidPublicKey ?? null;
}

export async function guardarSuscripcion(
  usuarioId: string,
  suscripcion: { endpoint: string; keys: { p256dh: string; auth: string } }
) {
  await prisma.pushSubscription.upsert({
    where: { endpoint: suscripcion.endpoint },
    update: { usuarioId, p256dh: suscripcion.keys.p256dh, auth: suscripcion.keys.auth },
    create: {
      usuarioId,
      endpoint: suscripcion.endpoint,
      p256dh: suscripcion.keys.p256dh,
      auth: suscripcion.keys.auth,
    },
  });
}

export async function eliminarSuscripcion(usuarioId: string, endpoint: string) {
  await prisma.pushSubscription.deleteMany({ where: { usuarioId, endpoint } });
}

interface PushPayload {
  titulo: string;
  mensaje: string;
  entidadTipo?: string;
  entidadId?: string;
}

// Envia un push real (notificacion del sistema operativo) a cada
// dispositivo/navegador suscrito de los usuarios indicados. Nunca lanza: si
// el modulo no esta configurado (faltan claves VAPID) o si una suscripcion
// puntual falla, se ignora -- el push es un complemento a la notificacion
// que ya se creo en la app (ver notificaciones.service.ts), nunca el unico
// canal, asi que un error aca no deberia tumbar la accion que lo disparo
// (ej. activar la alerta SOS).
export async function enviarPushAUsuarios(usuarioIds: string[], payload: PushPayload) {
  if (!habilitado || usuarioIds.length === 0) return;

  const suscripciones = await prisma.pushSubscription.findMany({
    where: { usuarioId: { in: usuarioIds } },
  });
  if (suscripciones.length === 0) return;

  const cuerpo = JSON.stringify(payload);

  await Promise.all(
    suscripciones.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, cuerpo);
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        // 404/410: el navegador invalido la suscripcion (desinstalo la app, borro datos, etc.) -- se limpia.
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.deleteMany({ where: { id: s.id } });
        }
      }
    })
  );
}
