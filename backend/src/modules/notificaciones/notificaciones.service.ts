import { prisma } from "../../lib/prisma";

// Soporte transversal para HU-13 (aviso de encomienda) y HU-16 (recibir comunicados).
export async function crearNotificacion(data: {
  usuarioId: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  entidadTipo?: string;
  entidadId?: string;
}) {
  return prisma.notificacion.create({ data });
}

export async function crearNotificacionesMasivas(
  usuarioIds: string[],
  data: { tipo: string; titulo: string; mensaje: string; entidadTipo?: string; entidadId?: string }
) {
  if (usuarioIds.length === 0) return;
  await prisma.notificacion.createMany({
    data: usuarioIds.map((usuarioId) => ({ usuarioId, ...data })),
  });
}

export async function listarNotificaciones(usuarioId: string) {
  return prisma.notificacion.findMany({
    where: { usuarioId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function marcarLeida(usuarioId: string, notificacionId: string) {
  return prisma.notificacion.updateMany({
    where: { id: notificacionId, usuarioId },
    data: { leida: true },
  });
}

export async function marcarTodasLeidas(usuarioId: string) {
  return prisma.notificacion.updateMany({
    where: { usuarioId, leida: false },
    data: { leida: true },
  });
}
