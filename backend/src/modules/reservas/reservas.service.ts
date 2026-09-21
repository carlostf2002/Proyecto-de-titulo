import { EstadoReserva } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ConflictError, ForbiddenError, NotFoundError } from "../../lib/errors";

function seSuperponen(aInicio: string, aFin: string, bInicio: string, bFin: string): boolean {
  return aInicio < bFin && bInicio < aFin;
}

// HU-04: disponibilidad del espacio comun para una fecha determinada.
export async function consultarDisponibilidad(condominioId: string, espacioComunId: string, fecha: string) {
  const espacio = await prisma.espacioComun.findFirst({ where: { id: espacioComunId, condominioId } });
  if (!espacio) throw new NotFoundError("Espacio comun no encontrado.");

  const reservas = await prisma.reserva.findMany({
    where: {
      espacioComunId,
      fecha: new Date(fecha),
      estado: EstadoReserva.CONFIRMADA,
    },
    select: { horaInicio: true, horaFin: true },
    orderBy: { horaInicio: "asc" },
  });

  return {
    espacio,
    horariosOcupados: reservas,
  };
}

// HU-05: realizar reserva evitando conflictos (RNF-10).
export async function crearReserva(
  condominioId: string,
  usuarioId: string,
  data: { espacioComunId: string; fecha: string; horaInicio: string; horaFin: string }
) {
  const espacio = await prisma.espacioComun.findFirst({
    where: { id: data.espacioComunId, condominioId, activo: true },
  });
  if (!espacio) throw new NotFoundError("Espacio comun no encontrado o no disponible.");

  if (data.horaInicio < espacio.horarioInicio || data.horaFin > espacio.horarioFin) {
    throw new ConflictError(
      `El espacio "${espacio.nombre}" solo esta disponible entre ${espacio.horarioInicio} y ${espacio.horarioFin}.`
    );
  }

  return prisma.$transaction(async (tx) => {
    const existentes = await tx.reserva.findMany({
      where: {
        espacioComunId: data.espacioComunId,
        fecha: new Date(data.fecha),
        estado: EstadoReserva.CONFIRMADA,
      },
      select: { horaInicio: true, horaFin: true },
    });

    const hayConflicto = existentes.some((r) =>
      seSuperponen(data.horaInicio, data.horaFin, r.horaInicio, r.horaFin)
    );
    if (hayConflicto) {
      throw new ConflictError("El horario seleccionado ya se encuentra reservado. Elige otro horario.");
    }

    return tx.reserva.create({
      data: {
        espacioComunId: data.espacioComunId,
        usuarioId,
        fecha: new Date(data.fecha),
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
      },
      include: { espacioComun: true },
    });
  });
}

export async function listarMisReservas(usuarioId: string) {
  return prisma.reserva.findMany({
    where: { usuarioId },
    include: { espacioComun: true },
    orderBy: { fecha: "desc" },
  });
}

// El administrador puede consultar todas las reservas existentes.
export async function listarReservasCondominio(condominioId: string) {
  return prisma.reserva.findMany({
    where: { espacioComun: { condominioId } },
    include: {
      espacioComun: true,
      usuario: { select: { id: true, nombre: true, apellido: true, departamento: true } },
    },
    orderBy: { fecha: "desc" },
  });
}

export async function cancelarReserva(
  condominioId: string,
  usuarioId: string,
  rolEsAdmin: boolean,
  reservaId: string
) {
  const reserva = await prisma.reserva.findFirst({
    where: { id: reservaId, espacioComun: { condominioId } },
  });
  if (!reserva) throw new NotFoundError("Reserva no encontrada.");
  if (!rolEsAdmin && reserva.usuarioId !== usuarioId) {
    throw new ForbiddenError("Solo puedes cancelar tus propias reservas.");
  }

  return prisma.reserva.update({
    where: { id: reservaId },
    data: { estado: EstadoReserva.CANCELADA },
  });
}
