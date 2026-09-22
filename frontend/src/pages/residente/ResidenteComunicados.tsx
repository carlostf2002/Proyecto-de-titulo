import { Megaphone } from "@phosphor-icons/react";
import { comunicadosApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Alert, Badge, Card, EmptyState, PageHeader, Spinner } from "../../components/ui";
import { formatFechaHora } from "../../lib/format";
import { TIPO_COMUNICADO_LABEL } from "../../lib/badges";

export default function ResidenteComunicados() {
  const { data, cargando, error } = useAsync(() => comunicadosApi.listar(), []);

  return (
    <div className="space-y-6">
      <PageHeader icon={Megaphone} title="Comunicados" subtitle="Avisos publicados por la administracion (HU-16)." />

      <Card>
        {cargando ? (
          <Spinner />
        ) : error ? (
          <Alert tone="red">{error}</Alert>
        ) : !data?.length ? (
          <EmptyState icon={Megaphone} title="Aun no hay comunicados publicados" />
        ) : (
          <div className="divide-y divide-slate-50">
            {data.map((c) => (
              <div key={c.id} className="px-5 py-4 transition-colors hover:bg-slate-50/70">
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{c.titulo}</p>
                  <Badge tone="blue">{TIPO_COMUNICADO_LABEL[c.tipo]}</Badge>
                </div>
                <p className="text-sm text-slate-600">{c.contenido}</p>
                <p className="mt-1 text-xs text-slate-400">{formatFechaHora(c.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
