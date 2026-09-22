import { FormEvent, useState } from "react";
import { encomiendasApi, usuariosApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Package } from "@phosphor-icons/react";
import { Alert, Badge, Button, Card, CardHeader, EmptyState, Input, Label, PageHeader, Select, Spinner } from "../../components/ui";
import { formatFechaHora } from "../../lib/format";
import { ESTADO_ENCOMIENDA_TONO } from "../../lib/badges";
import { mensajeError } from "../../api/client";

export default function ConserjeEncomiendas() {
  const { data, cargando, error, recargar } = useAsync(() => encomiendasApi.listarTodas(), []);
  const { data: residentes } = useAsync(() => usuariosApi.listar({ rol: "RESIDENTE" }), []);

  const [usuarioId, setUsuarioId] = useState("");
  const [remitente, setRemitente] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setEnviando(true);
    try {
      await encomiendasApi.crear({ usuarioId, remitente: remitente || undefined });
      setUsuarioId("");
      setRemitente("");
      recargar();
    } catch (err) {
      setFormError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  }

  const pendientes = data?.filter((e) => e.estado !== "RETIRADA") ?? [];

  return (
    <div className="space-y-6">
      <PageHeader icon={Package} title="Encomiendas" subtitle="Registro de recepcion y retiro (HU-12, HU-14)." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-fit">
          <CardHeader title="Registrar encomienda" />
          <form onSubmit={handleSubmit} className="space-y-3 p-5">
            <div>
              <Label>Residente</Label>
              <Select required value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
                <option value="">Selecciona un residente</option>
                {residentes?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} {r.apellido}
                    {r.departamento ? ` (${r.departamento.torre?.nombre ?? ""} ${r.departamento.numero})` : ""}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Remitente / empresa (opcional)</Label>
              <Input value={remitente} onChange={(e) => setRemitente(e.target.value)} />
            </div>
            {formError && <Alert tone="red">{formError}</Alert>}
            <Button type="submit" className="w-full" loading={enviando}>
              Registrar y notificar
            </Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Pendientes de retiro" />
          {cargando ? (
            <Spinner />
          ) : error ? (
            <Alert tone="red">{error}</Alert>
          ) : !pendientes.length ? (
            <EmptyState title="No hay encomiendas pendientes" />
          ) : (
            <div className="divide-y divide-slate-50">
              {pendientes.map((enc) => (
                <div key={enc.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {enc.usuario ? `${enc.usuario.nombre} ${enc.usuario.apellido}` : "—"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {enc.remitente ?? "Sin remitente"} · {formatFechaHora(enc.fechaRecepcion)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={ESTADO_ENCOMIENDA_TONO[enc.estado]}>{enc.estado}</Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        await encomiendasApi.marcarRetirada(enc.id);
                        recargar();
                      }}
                    >
                      Marcar retirada
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
