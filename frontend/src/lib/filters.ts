// Filtro de rango de fechas para listas client-side. Compara solo el dia
// (en la zona horaria local del navegador), ignorando la hora — pensado para
// campos DateTime reales (encomiendas, accesos), no para fechas puras ya
// normalizadas por formatFecha.
export function fechaEnRango(fechaISO: string, desde: string, hasta: string): boolean {
  if (!desde && !hasta) return true;
  const fecha = new Date(fechaISO);
  const soloDia = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  if (desde && soloDia < new Date(`${desde}T00:00:00`)) return false;
  if (hasta && soloDia > new Date(`${hasta}T00:00:00`)) return false;
  return true;
}
