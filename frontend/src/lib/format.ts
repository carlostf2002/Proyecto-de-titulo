// Los campos "fecha" (Reserva, Multa, Visita) son fechas puras (@db.Date) sin componente horario.
// Se leen los digitos directamente desde el ISO recibido para evitar que la conversion a
// la zona horaria local del navegador retroceda un dia (p. ej. "2026-09-21T00:00:00.000Z" en UTC-3
// se transformaria en 20 de septiembre si se pasara por new Date(...).toLocaleDateString()).
export function formatFecha(fecha: string | Date): string {
  if (typeof fecha === "string") {
    const match = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, anio, mes, dia] = match;
      return `${dia}-${mes}-${anio}`;
    }
  }
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatFechaHora(fecha: string | Date): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return d.toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMonto(monto: number): string {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(
    monto
  );
}
