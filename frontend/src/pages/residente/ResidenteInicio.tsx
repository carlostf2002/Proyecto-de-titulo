import { motion } from "framer-motion";
import { House, Megaphone, Package, Warning, Wrench } from "@phosphor-icons/react";
import { useAuth } from "../../context/AuthContext";
import { comunicadosApi, encomiendasApi, incidenciasApi, multasApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Card, EmptyState, PageHeader, Spinner, StatCard, staggerFade } from "../../components/ui";
import { formatFechaHora } from "../../lib/format";

export default function ResidenteInicio() {
  const { usuario } = useAuth();
  const { data: multas, cargando: cargandoMultas } = useAsync(() => multasApi.mias(), []);
  const { data: incidencias, cargando: cargandoIncidencias } = useAsync(() => incidenciasApi.mias(), []);
  const { data: encomiendas, cargando: cargandoEncomiendas } = useAsync(() => encomiendasApi.mias(), []);
  const { data: comunicados, cargando: cargandoComunicados } = useAsync(() => comunicadosApi.listar(), []);

  const multasPendientes = multas?.filter((m) => m.estado === "PENDIENTE").length ?? 0;
  const incidenciasAbiertas = incidencias?.filter((i) => i.estado !== "RESUELTA").length ?? 0;
  const encomiendasPorRetirar = encomiendas?.filter((e) => e.estado !== "RETIRADA").length ?? 0;

  const cargando = cargandoMultas || cargandoIncidencias || cargandoEncomiendas || cargandoComunicados;

  return (
    <div className="space-y-6">
      <PageHeader icon={House} title={`Hola, ${usuario?.nombre ?? ""}`} subtitle="Resumen de tu unidad en HabitaSmart." />

      {cargando ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatCard to="/multas" icon={Warning} label="Multas pendientes" value={multasPendientes} tone="amber" index={0} />
            <StatCard to="/incidencias" icon={Wrench} label="Incidencias abiertas" value={incidenciasAbiertas} tone="brand" index={1} />
            <StatCard to="/encomiendas" icon={Package} label="Encomiendas por retirar" value={encomiendasPorRetirar} tone="purple" index={2} />
          </div>

          <Card>
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 px-5 py-4">
              <Megaphone size={16} className="text-slate-400 dark:text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ultimos comunicados</h3>
            </div>
            {!comunicados?.length ? (
              <EmptyState icon={Megaphone} title="Sin comunicados recientes" />
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {comunicados.slice(0, 5).map((c, i) => (
                  <motion.div key={c.id} {...staggerFade(i)} className="px-5 py-3 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-700/60">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{c.titulo}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatFechaHora(c.createdAt)}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
