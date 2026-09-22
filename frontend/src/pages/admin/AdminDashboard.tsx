import { ChartBar, CheckCircle, Clock, Package, QrCode, Warning } from "@phosphor-icons/react";
import { dashboardApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Card, CardHeader, EmptyState, Spinner, Alert, Badge, PageHeader, StatCard } from "../../components/ui";
import { formatFechaHora } from "../../lib/format";

export default function AdminDashboard() {
  const { data, cargando, error } = useAsync(() => dashboardApi.indicadores(), []);

  if (cargando) return <Spinner />;
  if (error) return <Alert tone="red">{error}</Alert>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <PageHeader icon={ChartBar} title="Panel administrativo" subtitle="Indicadores generales del condominio (HU-24)." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={Warning} label="Incidencias pendientes" value={data.incidencias.pendientes} tone="amber" index={0} />
        <StatCard icon={CheckCircle} label="Incidencias resueltas" value={data.incidencias.resueltas} tone="green" index={1} />
        <StatCard icon={Clock} label="Reservas proximas" value={data.reservas.proximas} tone="brand" index={2} />
        <StatCard icon={Package} label="Encomiendas por retirar" value={data.encomiendas.pendientesDeRetiro} tone="purple" index={3} />
        <StatCard icon={QrCode} label="Accesos autorizados (ult. 10)" value={data.accesos.autorizadosUltimos10} tone="green" index={4} />
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
          <EmptyState icon={QrCode} title="Sin accesos registrados" />
        ) : (
          <div className="divide-y divide-slate-100">
            {data.accesos.recientes.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-slate-50/70">
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
