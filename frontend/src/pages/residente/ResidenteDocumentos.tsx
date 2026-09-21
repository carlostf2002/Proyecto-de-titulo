import { documentosApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Alert, Card, EmptyState, Spinner } from "../../components/ui";
import { formatFecha } from "../../lib/format";

export default function ResidenteDocumentos() {
  const { data, cargando, error } = useAsync(() => documentosApi.listar(), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Documentos</h1>
        <p className="text-sm text-slate-500">Reglamentos y documentos informativos del condominio (HU-23).</p>
      </div>

      <Card>
        {cargando ? (
          <Spinner />
        ) : error ? (
          <Alert tone="red">{error}</Alert>
        ) : !data?.length ? (
          <EmptyState title="Aun no hay documentos publicados" />
        ) : (
          <div className="divide-y divide-slate-50">
            {data.map((doc) => (
              <a
                key={doc.id}
                href={doc.archivoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{doc.titulo}</p>
                  <p className="text-xs text-slate-400">
                    {doc.categoria ?? "General"} · {formatFecha(doc.createdAt)}
                  </p>
                </div>
                <span className="text-xs text-brand-600">Ver →</span>
              </a>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
