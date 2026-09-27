type Tono = "slate" | "blue" | "green" | "amber" | "red" | "purple";

export const ESTADO_MULTA_TONO: Record<string, Tono> = {
  PENDIENTE: "amber",
  PAGADA: "green",
  APELADA: "purple",
  ANULADA: "slate",
};

export const ESTADO_MULTA_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagada",
  APELADA: "Apelada",
  ANULADA: "Anulada",
};

export const ESTADO_INCIDENCIA_TONO: Record<string, Tono> = {
  REPORTADA: "amber",
  EN_REVISION: "blue",
  EN_PROCESO: "purple",
  RESUELTA: "green",
};

export const ESTADO_INCIDENCIA_LABEL: Record<string, string> = {
  REPORTADA: "Reportada",
  EN_REVISION: "En revisión",
  EN_PROCESO: "En proceso",
  RESUELTA: "Resuelta",
};

export const PRIORIDAD_TONO: Record<string, Tono> = {
  BAJA: "slate",
  MEDIA: "amber",
  ALTA: "red",
};

export const PRIORIDAD_LABEL: Record<string, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
};

export const ESTADO_ENCOMIENDA_TONO: Record<string, Tono> = {
  NOTIFICADA: "amber",
  RETIRADA: "green",
};

export const ESTADO_ENCOMIENDA_LABEL: Record<string, string> = {
  NOTIFICADA: "Notificada",
  RETIRADA: "Retirada",
};

export const ESTADO_VISITA_TONO: Record<string, Tono> = {
  VIGENTE: "green",
  USADA: "slate",
  EXPIRADA: "slate",
  REVOCADA: "red",
};

export const ESTADO_VISITA_LABEL: Record<string, string> = {
  VIGENTE: "Vigente",
  USADA: "Usada",
  EXPIRADA: "Expirada",
  REVOCADA: "Revocada",
};

export const ESTADO_RESERVA_TONO: Record<string, Tono> = {
  CONFIRMADA: "green",
  CANCELADA: "slate",
};

export const ESTADO_RESERVA_LABEL: Record<string, string> = {
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
};

export const RESULTADO_ACCESO_LABEL: Record<string, string> = {
  AUTORIZADO: "Autorizado",
  RECHAZADO: "Rechazado",
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
