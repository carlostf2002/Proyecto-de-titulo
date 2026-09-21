import { encomiendasApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Alert, Badge, Card, EmptyState, Spinner } from "../../components/ui";
import { formatFechaHora } from "../../lib/format";
import { ESTADO_ENCOMIENDA_TONO } from "../../lib/badges";

export default function AdminEncomiendas() {
  const { data, cargando, error } = useAsync(() => encomiendasApi.listarTodas(), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Encomiendas</h1>
        <p className="text-sm text-slate-500">Visibilidad de encomiendas registradas por conserjeria (HU-12 a HU-14).</p>
      </div>

      <Card>
        {cargando ? (
          <Spinner />
        ) : error ? (
          <Alert tone="red">{error}</Alert>
        ) : !data?.length ? (
          <EmptyState title="Aun no hay encomiendas registradas" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Residente</th>
                  <th className="px-5 py-3">Remitente</th>
                  <th className="px-5 py-3">Recepcion</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((enc) => (
                  <tr key={enc.id}>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {enc.usuario ? `${enc.usuario.nombre} ${enc.usuario.apellido}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{enc.remitente ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-500">{formatFechaHora(enc.fechaRecepcion)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={ESTADO_ENCOMIENDA_TONO[enc.estado]}>{enc.estado}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
