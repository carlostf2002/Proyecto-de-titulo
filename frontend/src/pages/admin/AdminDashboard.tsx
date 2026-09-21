import { dashboardApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Card, CardHeader, EmptyState, Spinner, Alert, Badge } from "../../components/ui";
import { formatFechaHora } from "../../lib/format";

function StatCard({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${tone ?? "text-slate-900"}`}>{value}</p>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data, cargando, error } = useAsync(() => dashboardApi.indicadores(), []);

  if (cargando) return <Spinner />;
  if (error) return <Alert tone="red">{error}</Alert>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Panel administrativo</h1>
        <p className="text-sm text-slate-500">Indicadores generales del condominio (HU-24).</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Incidencias pendientes" value={data.incidencias.pendientes} tone="text-amber-600" />
        <StatCard label="Incidencias resueltas" value={data.incidencias.resueltas} tone="text-emerald-600" />
        <StatCard label="Reservas proximas" value={data.reservas.proximas} tone="text-brand-600" />
        <StatCard label="Encomiendas por retirar" value={data.encomiendas.pendientesDeRetiro} tone="text-purple-600" />
        <StatCard label="Accesos autorizados (ult. 10)" value={data.accesos.autorizadosUltimos10} tone="text-emerald-600" />
      </div>

      <Card>
        <CardHeader title="Multas por estado" />
        <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          {Object.entries(data.multas).map(([estado, cantidad]) => (
            <div key={estado} className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-lg font-bold text-slate-900">{cantidad}</p>
              <p className="text-xs text-slate-500">{estado}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Accesos recientes" subtitle="Ultimos 10 registros de validacion QR" />
        {data.accesos.recientes.length === 0 ? (
          <EmptyState title="Sin accesos registrados" />
        ) : (
          <div className="divide-y divide-slate-100">
            {data.accesos.recientes.map((a) => (
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
