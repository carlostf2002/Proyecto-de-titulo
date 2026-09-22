import { FormEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, FileText } from "@phosphor-icons/react";
import { documentosApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Alert, Button, Card, CardHeader, EmptyState, Input, Label, PageHeader, Spinner, staggerFade } from "../../components/ui";
import { formatFecha } from "../../lib/format";
import { mensajeError } from "../../api/client";

export default function AdminDocumentos() {
  const { data, cargando, error, recargar } = useAsync(() => documentosApi.listar(), []);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const archivo = fileRef.current?.files?.[0];
    if (!archivo) {
      setFormError("Selecciona un archivo.");
      return;
    }
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      if (categoria) formData.append("categoria", categoria);
      formData.append("archivo", archivo);
      await documentosApi.crear(formData);
      setTitulo("");
      setCategoria("");
      if (fileRef.current) fileRef.current.value = "";
      recargar();
    } catch (err) {
      setFormError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={FileText} title="Repositorio de documentos" subtitle="Reglamentos y documentos informativos (HU-22, HU-23)." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Documentos publicados" />
          {cargando ? (
            <Spinner />
          ) : error ? (
            <Alert tone="red">{error}</Alert>
          ) : !data?.length ? (
            <EmptyState icon={FileText} title="Aun no hay documentos publicados" />
          ) : (
            <div className="divide-y divide-slate-50">
              {data.map((doc, i) => (
                <motion.a
                  key={doc.id}
                  {...staggerFade(i)}
                  href={doc.archivoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between px-5 py-3 transition-colors hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{doc.titulo}</p>
                    <p className="text-xs text-slate-400">
                      {doc.categoria ?? "General"} · {formatFecha(doc.createdAt)}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-brand-600 transition-transform group-hover:translate-x-0.5">
                    Ver <ArrowRight size={14} />
                  </span>
                </motion.a>
              ))}
            </div>
          )}
        </Card>

        <Card className="h-fit">
          <CardHeader title="Publicar documento" />
          <form onSubmit={handleSubmit} className="space-y-3 p-5">
            <div>
              <Label>Titulo</Label>
              <Input required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div>
              <Label>Categoria</Label>
              <Input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Reglamento" />
            </div>
            <div>
              <Label>Archivo (PDF, imagen)</Label>
              <input ref={fileRef} type="file" accept=".pdf,image/*" className="block w-full text-sm" />
            </div>
            {formError && <Alert tone="red">{formError}</Alert>}
            <Button type="submit" className="w-full" loading={enviando}>
              Publicar documento
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
