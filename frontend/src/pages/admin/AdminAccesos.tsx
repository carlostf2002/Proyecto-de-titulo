import { motion } from "framer-motion";
import { QrCode } from "@phosphor-icons/react";
import { qrApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Alert, Badge, Card, EmptyState, PageHeader, Spinner, staggerFade } from "../../components/ui";
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
      <PageHeader icon={QrCode} title="Control de acceso" subtitle="Historial de validaciones de codigos QR (HU-18, HU-21)." />

      <Card>
        {cargando ? (
          <Spinner />
        ) : error ? (
          <Alert tone="red">{error}</Alert>
        ) : !data?.length ? (
          <EmptyState icon={QrCode} title="Aun no hay accesos registrados" />
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {data.map((a, i) => (
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
