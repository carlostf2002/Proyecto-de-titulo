import { EstadoEncomienda, EstadoIncidencia, EstadoMulta, ResultadoAcceso } from "@prisma/client";
import { prisma } from "../../lib/prisma";

// HU-24: indicadores generales del condominio para la administracion.
export async function obtenerIndicadores(condominioId: string) {
  const [
    incidenciasPendientes,
    incidenciasResueltas,
    incidenciasPorEstado,
    reservasProximas,
    multasPorEstado,
    encomiendasPendientes,
    accesosRecientes,
    accesosPorResultado,
  ] = await Promise.all([
    prisma.incidencia.count({
      where: { condominioId, estado: { in: [EstadoIncidencia.REPORTADA, EstadoIncidencia.EN_REVISION, EstadoIncidencia.EN_PROCESO] } },
    }),
    prisma.incidencia.count({ where: { condominioId, estado: EstadoIncidencia.RESUELTA } }),
    prisma.incidencia.groupBy({
      by: ["estado"],
      where: { condominioId },
      _count: { _all: true },
    }),
    prisma.reserva.count({
      where: { espacioComun: { condominioId }, fecha: { gte: new Date() }, estado: "CONFIRMADA" },
    }),
    prisma.multa.groupBy({
      by: ["estado"],
      where: { condominioId },
      _count: { _all: true },
    }),
    prisma.encomienda.count({ where: { condominioId, estado: EstadoEncomienda.NOTIFICADA } }),
    prisma.accesoLog.findMany({
      where: { condominioId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { validadoPor: { select: { nombre: true, apellido: true } } },
    }),
    prisma.accesoLog.groupBy({
      by: ["resultado"],
      where: { condominioId },
      _count: { _all: true },
    }),
  ]);

  const multasPorEstadoMap = Object.fromEntries(
    Object.values(EstadoMulta).map((estado) => [
      estado,
      multasPorEstado.find((m) => m.estado === estado)?._count._all ?? 0,
    ])
  );

  const incidenciasPorEstadoMap = Object.fromEntries(
    Object.values(EstadoIncidencia).map((estado) => [
      estado,
      incidenciasPorEstado.find((i) => i.estado === estado)?._count._all ?? 0,
    ])
  );

  const accesosAutorizados = accesosPorResultado.find((a) => a.resultado === ResultadoAcceso.AUTORIZADO)?._count._all ?? 0;
  const accesosRechazados = accesosPorResultado.find((a) => a.resultado === ResultadoAcceso.RECHAZADO)?._count._all ?? 0;

  return {
    incidencias: {
      pendientes: incidenciasPendientes,
      resueltas: incidenciasResueltas,
      porEstado: incidenciasPorEstadoMap,
    },
    reservas: { proximas: reservasProximas },
    multas: multasPorEstadoMap,
    encomiendas: { pendientesDeRetiro: encomiendasPendientes },
    accesos: {
      recientes: accesosRecientes,
      autorizadosUltimos10: accesosRecientes.filter((a) => a.resultado === ResultadoAcceso.AUTORIZADO).length,
      totalAutorizados: accesosAutorizados,
      totalRechazados: accesosRechazados,
    },
  };
}
