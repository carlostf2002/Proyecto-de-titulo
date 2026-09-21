import QRCode from "qrcode";
import { EstadoVisita, ResultadoAcceso, TipoQrToken } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { signQrToken, verifyQrToken } from "../../lib/qrToken";
import { ConflictError, NotFoundError } from "../../lib/errors";

const VIGENCIA_QR_RESIDENTE_HORAS = 24;

async function generarImagenQr(token: string): Promise<string> {
  return QRCode.toDataURL(token, { errorCorrectionLevel: "M", margin: 1, width: 320 });
}

// HU-17: generar QR de residente. El token es un JWT sin datos personales, con expiracion (RNF-08, RNF-09).
export async function generarQrResidente(condominioId: string, usuarioId: string) {
  await prisma.qrToken.updateMany({
    where: { usuarioId, tipo: TipoQrToken.RESIDENTE, revocado: false },
    data: { revocado: true },
  });

  const expiraEn = new Date(Date.now() + VIGENCIA_QR_RESIDENTE_HORAS * 60 * 60 * 1000);
  const registro = await prisma.qrToken.create({
    data: { tipo: TipoQrToken.RESIDENTE, usuarioId, expiraEn, token: "" },
  });

  const token = signQrToken(registro.id, "RESIDENTE", expiraEn);
  await prisma.qrToken.update({ where: { id: registro.id }, data: { token } });

  return { qrDataUrl: await generarImagenQr(token), expiraEn };
}

// HU-19: registrar visita.
export async function crearVisita(
  condominioId: string,
  residenteId: string,
  data: {
    nombreVisita: string;
    fecha: string;
    periodoInicio: string;
    periodoFin: string;
    observaciones?: string;
    soloUnUso: boolean;
  }
) {
  return prisma.visita.create({
    data: {
      condominioId,
      residenteId,
      nombreVisita: data.nombreVisita,
      fecha: new Date(data.fecha),
      periodoInicio: new Date(data.periodoInicio),
      periodoFin: new Date(data.periodoFin),
      observaciones: data.observaciones,
      soloUnUso: data.soloUnUso,
    },
  });
}

export async function listarMisVisitas(residenteId: string) {
  return prisma.visita.findMany({
    where: { residenteId },
    include: { qrToken: { select: { expiraEn: true, revocado: true, usosRealizados: true } } },
    orderBy: { createdAt: "desc" },
  });
}

// HU-20: generar QR temporal de visita, con vigencia y posibilidad de uso unico.
export async function generarQrVisita(condominioId: string, residenteId: string, visitaId: string) {
  const visita = await prisma.visita.findFirst({
    where: { id: visitaId, condominioId, residenteId },
    include: { qrToken: true },
  });
  if (!visita) throw new NotFoundError("Visita no encontrada.");
  if (visita.estado !== EstadoVisita.VIGENTE) {
    throw new ConflictError("Esta visita no se encuentra vigente.");
  }
  if (visita.qrToken) {
    throw new ConflictError("Ya existe un codigo QR generado para esta visita.");
  }

  const registro = await prisma.qrToken.create({
    data: {
      tipo: TipoQrToken.VISITA,
      visitaId: visita.id,
      expiraEn: visita.periodoFin,
      usosMaximos: visita.soloUnUso ? 1 : null,
      token: "",
    },
  });

  const token = signQrToken(registro.id, "VISITA", visita.periodoFin);
  await prisma.qrToken.update({ where: { id: registro.id }, data: { token } });

  return { qrDataUrl: await generarImagenQr(token), expiraEn: visita.periodoFin };
}

// HU-20: revocar autorizacion de visita.
export async function revocarVisita(condominioId: string, residenteId: string, visitaId: string) {
  const visita = await prisma.visita.findFirst({ where: { id: visitaId, condominioId, residenteId } });
  if (!visita) throw new NotFoundError("Visita no encontrada.");

  await prisma.$transaction([
    prisma.visita.update({ where: { id: visitaId }, data: { estado: EstadoVisita.REVOCADA } }),
    prisma.qrToken.updateMany({ where: { visitaId }, data: { revocado: true } }),
  ]);

  return { revocado: true };
}

interface ResultadoValidacion {
  resultado: ResultadoAcceso;
  motivo: string;
  detalle?: Record<string, unknown>;
}

// HU-18 / HU-21: validar QR de residente o de visita mediante escaneo en conserjeria.
export async function validarQr(
  condominioId: string,
  validadoPorId: string,
  tokenCrudo: string
): Promise<ResultadoValidacion> {
  let registro;
  try {
    const payload = verifyQrToken(tokenCrudo);
    registro = await prisma.qrToken.findUnique({
      where: { id: payload.jti },
      include: {
        usuario: { select: { id: true, nombre: true, apellido: true, departamento: true } },
        visita: true,
      },
    });
  } catch {
    return registrarResultado(condominioId, validadoPorId, null, ResultadoAcceso.RECHAZADO, "Codigo QR invalido o expirado.");
  }

  if (!registro) {
    return registrarResultado(condominioId, validadoPorId, null, ResultadoAcceso.RECHAZADO, "Codigo QR no reconocido.");
  }

  if (registro.revocado) {
    return registrarResultado(condominioId, validadoPorId, registro.id, ResultadoAcceso.RECHAZADO, "El codigo QR fue revocado.");
  }

  if (registro.expiraEn.getTime() < Date.now()) {
    return registrarResultado(condominioId, validadoPorId, registro.id, ResultadoAcceso.RECHAZADO, "El codigo QR se encuentra vencido.");
  }

  if (registro.usosMaximos !== null && registro.usosRealizados >= registro.usosMaximos) {
    return registrarResultado(condominioId, validadoPorId, registro.id, ResultadoAcceso.RECHAZADO, "El codigo QR ya fue utilizado.");
  }

  if (registro.tipo === TipoQrToken.RESIDENTE) {
    if (!registro.usuario) {
      return registrarResultado(condominioId, validadoPorId, registro.id, ResultadoAcceso.RECHAZADO, "Residente asociado no encontrado.");
    }
    await prisma.qrToken.update({ where: { id: registro.id }, data: { usosRealizados: { increment: 1 } } });
    return registrarResultado(
      condominioId,
      validadoPorId,
      registro.id,
      ResultadoAcceso.AUTORIZADO,
      "Acceso de residente autorizado.",
      { residente: registro.usuario }
    );
  }

  // Validacion de visita.
  const visita = registro.visita;
  if (!visita || visita.estado === EstadoVisita.REVOCADA) {
    return registrarResultado(condominioId, validadoPorId, registro.id, ResultadoAcceso.RECHAZADO, "La autorizacion de visita fue revocada.");
  }
  const ahora = Date.now();
  if (ahora < visita.periodoInicio.getTime() || ahora > visita.periodoFin.getTime()) {
    return registrarResultado(condominioId, validadoPorId, registro.id, ResultadoAcceso.RECHAZADO, "La visita esta fuera del periodo autorizado.");
  }

  await prisma.qrToken.update({ where: { id: registro.id }, data: { usosRealizados: { increment: 1 } } });
  if (visita.soloUnUso) {
    await prisma.visita.update({ where: { id: visita.id }, data: { estado: EstadoVisita.USADA } });
  }

  return registrarResultado(
    condominioId,
    validadoPorId,
    registro.id,
    ResultadoAcceso.AUTORIZADO,
    "Acceso de visita autorizado.",
    { visita: { nombreVisita: visita.nombreVisita, residenteId: visita.residenteId } }
  );
}

async function registrarResultado(
  condominioId: string,
  validadoPorId: string,
  qrTokenId: string | null,
  resultado: ResultadoAcceso,
  motivo: string,
  detalle?: Record<string, unknown>
): Promise<ResultadoValidacion> {
  await prisma.accesoLog.create({
    data: { condominioId, validadoPorId, qrTokenId, resultado, motivo },
  });
  return { resultado, motivo, detalle };
}

export async function listarAccesos(condominioId: string) {
  return prisma.accesoLog.findMany({
    where: { condominioId },
    include: { validadoPor: { select: { id: true, nombre: true, apellido: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}
