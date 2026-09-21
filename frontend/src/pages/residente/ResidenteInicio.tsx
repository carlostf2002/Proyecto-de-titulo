import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { comunicadosApi, encomiendasApi, incidenciasApi, multasApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Card, Spinner } from "../../components/ui";
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
      <div>
        <h1 className="text-xl font-bold text-slate-900">Hola, {usuario?.nombre}</h1>
        <p className="text-sm text-slate-500">Resumen de tu unidad en HabitaSmart.</p>
      </div>

      {cargando ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <ResumenCard to="/multas" label="Multas pendientes" value={multasPendientes} />
            <ResumenCard to="/incidencias" label="Incidencias abiertas" value={incidenciasAbiertas} />
            <ResumenCard to="/encomiendas" label="Encomiendas por retirar" value={encomiendasPorRetirar} />
          </div>

          <Card>
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Ultimos comunicados</h3>
            </div>
            {!comunicados?.length ? (
              <p className="px-5 py-6 text-center text-sm text-slate-400">Sin comunicados recientes.</p>
            ) : (
              <div className="divide-y divide-slate-50">
                {comunicados.slice(0, 5).map((c) => (
                  <div key={c.id} className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-800">{c.titulo}</p>
                    <p className="text-xs text-slate-500">{formatFechaHora(c.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function ResumenCard({ to, label, value }: { to: string; label: string; value: number }) {
  return (
    <Link to={to}>
      <Card className="p-5 transition hover:border-brand-300 hover:shadow-md">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      </Card>
    </Link>
  );
}
