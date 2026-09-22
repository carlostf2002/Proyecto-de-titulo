import { motion } from "framer-motion";
import { CalendarBlank } from "@phosphor-icons/react";
import { reservasApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Alert, Badge, Button, Card, EmptyState, PageHeader, Spinner, staggerFade } from "../../components/ui";
import { formatFecha } from "../../lib/format";
import { ESTADO_RESERVA_TONO } from "../../lib/badges";

export default function AdminReservas() {
  const { data, cargando, error, recargar } = useAsync(() => reservasApi.listarTodas(), []);

  return (
    <div className="space-y-6">
      <PageHeader icon={CalendarBlank} title="Reservas de espacios comunes" subtitle="Consulta de todas las reservas realizadas (HU-05)." />

      <Card>
        {cargando ? (
          <Spinner />
        ) : error ? (
          <Alert tone="red">{error}</Alert>
        ) : !data?.length ? (
          <EmptyState title="Aun no hay reservas registradas" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Espacio</th>
                  <th className="px-5 py-3">Residente</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Horario</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((r, i) => (
                  <motion.tr key={r.id} {...staggerFade(i)} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-medium text-slate-800">{r.espacioComun.nombre}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatFecha(r.fecha)}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {r.horaInicio} - {r.horaFin}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={ESTADO_RESERVA_TONO[r.estado]}>{r.estado}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {r.estado === "CONFIRMADA" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await reservasApi.cancelar(r.id);
                            recargar();
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
