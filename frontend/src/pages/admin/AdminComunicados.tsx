import { FormEvent, useState } from "react";
import { Megaphone } from "@phosphor-icons/react";
import { comunicadosApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Alert, Badge, Button, Card, CardHeader, EmptyState, Input, Label, PageHeader, Select, Spinner, Textarea } from "../../components/ui";
import { formatFechaHora } from "../../lib/format";
import { TIPO_COMUNICADO_LABEL } from "../../lib/badges";
import { mensajeError } from "../../api/client";
import type { TipoComunicado } from "../../types";

const TIPOS: TipoComunicado[] = [
  "GENERAL",
  "CORTE_AGUA",
  "CORTE_ELECTRICO",
  "MANTENCION",
  "REUNION",
  "EMERGENCIA",
  "CAMBIO_HORARIO",
];

export default function AdminComunicados() {
  const { data, cargando, error, recargar } = useAsync(() => comunicadosApi.listar(), []);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [tipo, setTipo] = useState<TipoComunicado>("GENERAL");
  const [formError, setFormError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setEnviando(true);
    try {
      await comunicadosApi.crear({ titulo, contenido, tipo });
      setTitulo("");
      setContenido("");
      recargar();
    } catch (err) {
      setFormError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Megaphone} title="Comunicados" subtitle="Publicacion de avisos para los residentes (HU-15, HU-16)." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Comunicados publicados" />
          {cargando ? (
            <Spinner />
          ) : error ? (
            <Alert tone="red">{error}</Alert>
          ) : !data?.length ? (
            <EmptyState title="Aun no hay comunicados publicados" />
          ) : (
            <div className="divide-y divide-slate-50">
              {data.map((c) => (
                <div key={c.id} className="px-5 py-4">
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

        <Card className="h-fit">
          <CardHeader title="Publicar nuevo comunicado" />
          <form onSubmit={handleSubmit} className="space-y-3 p-5">
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onChange={(e) => setTipo(e.target.value as TipoComunicado)}>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {TIPO_COMUNICADO_LABEL[t]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Titulo</Label>
              <Input required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div>
              <Label>Contenido</Label>
              <Textarea required rows={4} value={contenido} onChange={(e) => setContenido(e.target.value)} />
            </div>
            {formError && <Alert tone="red">{formError}</Alert>}
            <Button type="submit" className="w-full" loading={enviando}>
              Publicar
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
