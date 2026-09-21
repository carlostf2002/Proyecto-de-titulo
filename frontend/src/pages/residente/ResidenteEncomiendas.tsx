import { encomiendasApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Alert, Badge, Card, EmptyState, Spinner } from "../../components/ui";
import { formatFechaHora } from "../../lib/format";
import { ESTADO_ENCOMIENDA_TONO } from "../../lib/badges";

export default function ResidenteEncomiendas() {
  const { data, cargando, error } = useAsync(() => encomiendasApi.mias(), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Mis encomiendas</h1>
        <p className="text-sm text-slate-500">Notificaciones de encomiendas recibidas en conserjeria (HU-13).</p>
      </div>

      <Card>
        {cargando ? (
          <Spinner />
        ) : error ? (
          <Alert tone="red">{error}</Alert>
        ) : !data?.length ? (
          <EmptyState title="No tienes encomiendas registradas" />
        ) : (
          <div className="divide-y divide-slate-50">
            {data.map((enc) => (
              <div key={enc.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">{enc.remitente ?? "Remitente no especificado"}</p>
                  <p className="text-xs text-slate-500">Recibida el {formatFechaHora(enc.fechaRecepcion)}</p>
                </div>
                <Badge tone={ESTADO_ENCOMIENDA_TONO[enc.estado]}>{enc.estado}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
