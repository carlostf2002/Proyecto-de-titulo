type Tono = "slate" | "blue" | "green" | "amber" | "red" | "purple";

export const ESTADO_MULTA_TONO: Record<string, Tono> = {
  PENDIENTE: "amber",
  PAGADA: "green",
  APELADA: "purple",
  ANULADA: "slate",
};

export const ESTADO_INCIDENCIA_TONO: Record<string, Tono> = {
  REPORTADA: "amber",
  EN_REVISION: "blue",
  EN_PROCESO: "purple",
  RESUELTA: "green",
};

export const PRIORIDAD_TONO: Record<string, Tono> = {
  BAJA: "slate",
  MEDIA: "amber",
  ALTA: "red",
};

export const ESTADO_ENCOMIENDA_TONO: Record<string, Tono> = {
  RECIBIDA: "slate",
  NOTIFICADA: "amber",
  RETIRADA: "green",
};

export const ESTADO_VISITA_TONO: Record<string, Tono> = {
  VIGENTE: "green",
  USADA: "slate",
  EXPIRADA: "slate",
  REVOCADA: "red",
};

export const ESTADO_RESERVA_TONO: Record<string, Tono> = {
  CONFIRMADA: "green",
  CANCELADA: "slate",
};

export const TIPO_COMUNICADO_LABEL: Record<string, string> = {
  CORTE_AGUA: "Corte de agua",
  CORTE_ELECTRICO: "Corte electrico",
  MANTENCION: "Mantencion",
  REUNION: "Reunion",
  EMERGENCIA: "Emergencia",
  CAMBIO_HORARIO: "Cambio de horario",
  GENERAL: "General",
};
