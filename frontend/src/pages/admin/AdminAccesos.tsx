import { qrApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Alert, Badge, Card, EmptyState, Spinner } from "../../components/ui";
import { formatFechaHora } from "../../lib/format";

interface AccesoLog {
  id: string;
  resultado: "AUTORIZADO" | "RECHAZADO";
  motivo: string;
  createdAt: string;
  validadoPor: { nombre: string; apellido: string };
}

export default function AdminAccesos() {
  const { data, cargando, error } = useAsync(() => qrApi.accesos() as Promise<AccesoLog[]>, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Control de acceso</h1>
        <p className="text-sm text-slate-500">Historial de validaciones de codigos QR (HU-18, HU-21).</p>
      </div>

      <Card>
        {cargando ? (
          <Spinner />
        ) : error ? (
          <Alert tone="red">{error}</Alert>
        ) : !data?.length ? (
          <EmptyState title="Aun no hay accesos registrados" />
        ) : (
          <div className="divide-y divide-slate-50">
            {data.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm text-slate-700">{a.motivo}</p>
                  <p className="text-xs text-slate-400">
                    Validado por {a.validadoPor.nombre} {a.validadoPor.apellido} · {formatFechaHora(a.createdAt)}
                  </p>
                </div>
                <Badge tone={a.resultado === "AUTORIZADO" ? "green" : "red"}>{a.resultado}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
