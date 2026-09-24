import { motion } from "framer-motion";
import { ChartBar, CheckCircle, Clock, Package, QrCode, Warning } from "@phosphor-icons/react";
import { dashboardApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import {
  Card,
  CardHeader,
  EmptyState,
  Spinner,
  Alert,
  Badge,
  PageHeader,
  StatCard,
  staggerFade,
  HorizontalBarChart,
  Meter,
} from "../../components/ui";
import { formatFechaHora } from "../../lib/format";

// Paleta de estado (dataviz skill): good/warning/serious reservados para semantica
// de sanciones; nunca reutilizados como color de serie generico.
const COLOR_MULTA: Record<string, string> = {
  PENDIENTE: "#fab219", // warning
  PAGADA: "#0ca30c", // good
  APELADA: "#ec835a", // serious
  ANULADA: "#898781", // muted (estado inactivo)
};

// Incidencias es una progresion ordinal (reportada -> resuelta): un solo hue,
// mas oscuro = mas avanzado, tomado del ramp secuencial azul documentado.
const COLOR_INCIDENCIA: Record<string, string> = {
  REPORTADA: "#86b6ef",
  EN_REVISION: "#5598e7",
  EN_PROCESO: "#2a78d6",
  RESUELTA: "#1c5cab",
};

const LABEL_MULTA: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagada",
  APELADA: "Apelada",
  ANULADA: "Anulada",
};

const LABEL_INCIDENCIA: Record<string, string> = {
  REPORTADA: "Reportada",
  EN_REVISION: "En revision",
  EN_PROCESO: "En proceso",
  RESUELTA: "Resuelta",
};

export default function AdminDashboard() {
  const { data, cargando, error } = useAsync(() => dashboardApi.indicadores(), []);

  if (cargando) return <Spinner />;
  if (error) return <Alert tone="red">{error}</Alert>;
  if (!data) return null;

  const totalAccesos = data.accesos.totalAutorizados + data.accesos.totalRechazados;

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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Multas por estado" />
          <HorizontalBarChart
            items={Object.entries(data.multas).map(([estado, cantidad]) => ({
              label: LABEL_MULTA[estado] ?? estado,
              value: cantidad,
              color: COLOR_MULTA[estado] ?? "#898781",
            }))}
          />
        </Card>

        <Card>
          <CardHeader title="Incidencias por estado" subtitle="Progreso de reportada a resuelta" />
          <HorizontalBarChart
            items={Object.entries(data.incidencias.porEstado).map(([estado, cantidad]) => ({
              label: LABEL_INCIDENCIA[estado] ?? estado,
              value: cantidad,
              color: COLOR_INCIDENCIA[estado] ?? "#2a78d6",
            }))}
          />
        </Card>
      </div>

      <Card>
        <CardHeader title="Accesos por resultado" subtitle="Historico completo de validaciones QR" />
        {totalAccesos === 0 ? (
          <EmptyState icon={QrCode} title="Aun no hay accesos registrados" />
        ) : (
          <Meter label="Accesos autorizados" value={data.accesos.totalAutorizados} total={totalAccesos} color="#0ca30c" />
        )}
      </Card>

      <Card>
        <CardHeader title="Accesos recientes" subtitle="Ultimos 10 registros de validacion QR" />
        {data.accesos.recientes.length === 0 ? (
          <EmptyState icon={QrCode} title="Sin accesos registrados" />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {data.accesos.recientes.map((a, i) => (
              <motion.div key={a.id} {...staggerFade(i)} className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-700/60">
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{a.motivo}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Validado por {a.validadoPor.nombre} {a.validadoPor.apellido} · {formatFechaHora(a.createdAt)}
                  </p>
                </div>
                <Badge tone={a.resultado === "AUTORIZADO" ? "green" : "red"}>{a.resultado}</Badge>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
