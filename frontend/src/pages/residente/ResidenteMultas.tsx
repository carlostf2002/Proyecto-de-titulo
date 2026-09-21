import { multasApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Alert, Badge, Card, EmptyState, Spinner } from "../../components/ui";
import { formatFecha, formatMonto } from "../../lib/format";
import { ESTADO_MULTA_TONO } from "../../lib/badges";

export default function ResidenteMultas() {
  const { data, cargando, error } = useAsync(() => multasApi.mias(), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Mis multas</h1>
        <p className="text-sm text-slate-500">Motivo, monto y estado de tus sanciones (HU-07).</p>
      </div>

      <Card>
        {cargando ? (
          <Spinner />
        ) : error ? (
          <Alert tone="red">{error}</Alert>
        ) : !data?.length ? (
          <EmptyState title="No tienes multas registradas" />
        ) : (
          <div className="divide-y divide-slate-50">
            {data.map((m) => (
              <div key={m.id} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800">{m.motivo}</p>
                  <Badge tone={ESTADO_MULTA_TONO[m.estado]}>{m.estado}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {formatFecha(m.fecha)} · {formatMonto(m.monto)}
                </p>
                {m.observaciones && <p className="mt-1 text-xs text-slate-400">{m.observaciones}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
