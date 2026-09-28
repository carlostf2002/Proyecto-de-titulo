import { Rol, TipoEmergenciaSos } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { crearNotificacionesMasivas } from "../notificaciones/notificaciones.service";

const EMERGENCIA_LABEL: Record<TipoEmergenciaSos, string> = {
  CARABINEROS: "Carabineros",
  BOMBEROS: "Bomberos",
  AMBULANCIA: "Ambulancia",
};

// Boton SOS (HU adicional): el residente elige el tipo de emergencia; el
// telefono del residente hace la llamada real al numero de emergencia
// (eso lo resuelve el frontend via tel:), y en paralelo se avisa a
// conserjeria/administracion para que puedan asistir (abrir reja, guiar a
// la unidad, etc.) -- nunca reemplaza la llamada real.
export async function crearAlerta(condominioId: string, usuarioId: string, tipo: TipoEmergenciaSos) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { nombre: true, apellido: true, departamento: { select: { numero: true, torre: { select: { nombre: true } } } } },
  });

  const alerta = await prisma.alertaSos.create({
    data: { condominioId, usuarioId, tipo },
  });

  const destinatarios = await prisma.usuario.findMany({
    where: { condominioId, rol: { in: [Rol.ADMIN, Rol.CONSERJE] }, activo: true },
    select: { id: true },
  });

  const unidad = usuario?.departamento
    ? ` (${usuario.departamento.torre?.nombre ?? ""} ${usuario.departamento.numero})`.trim()
    : "";

  await crearNotificacionesMasivas(
    destinatarios.map((d) => d.id),
    {
      tipo: `SOS_${tipo}`,
      titulo: `🚨 Alerta SOS: ${EMERGENCIA_LABEL[tipo]}`,
      mensaje: usuario
        ? `${usuario.nombre} ${usuario.apellido}${unidad} activo una alerta de ${EMERGENCIA_LABEL[tipo]}.`
        : `Se activo una alerta de ${EMERGENCIA_LABEL[tipo]}.`,
      entidadTipo: "AlertaSos",
      entidadId: alerta.id,
    }
  );

  return alerta;
}

export async function listarAlertas(condominioId: string) {
  return prisma.alertaSos.findMany({
    where: { condominioId },
    include: { usuario: { select: { id: true, nombre: true, apellido: true, departamento: { include: { torre: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
