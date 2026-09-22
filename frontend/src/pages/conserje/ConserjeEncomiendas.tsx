import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { encomiendasApi, usuariosApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Package } from "@phosphor-icons/react";
import { Alert, Badge, Button, Card, CardHeader, EmptyState, Input, Label, PageHeader, Select, Spinner, staggerFade } from "../../components/ui";
import { formatFechaHora } from "../../lib/format";
import { ESTADO_ENCOMIENDA_TONO } from "../../lib/badges";
import { mensajeError } from "../../api/client";
import { useToast } from "../../context/ToastContext";

// Empresas de courier/encomiendas mas conocidas en Chile. "OTRO" habilita un
// campo de texto libre para remitentes que no esten en la lista.
const EMPRESAS_ENCOMIENDA = [
  "Correos de Chile",
  "Chilexpress",
  "Starken",
  "Blue Express",
  "DHL",
  "FedEx",
  "UPS",
  "TNT",
  "Servientrega",
  "Turbus Cargo",
];

export default function ConserjeEncomiendas() {
  const toast = useToast();
  const { data, cargando, error, recargar } = useAsync(() => encomiendasApi.listarTodas(), []);
  const { data: residentes } = useAsync(() => usuariosApi.listar({ rol: "RESIDENTE" }), []);

  const [usuarioId, setUsuarioId] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [otroRemitente, setOtroRemitente] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const esOtro = empresa === "OTRO";
  const remitente = esOtro ? otroRemitente : empresa;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setEnviando(true);
    try {
      await encomiendasApi.crear({ usuarioId, remitente: remitente || undefined });
      setUsuarioId("");
      setEmpresa("");
      setOtroRemitente("");
      toast.success("Encomienda registrada y residente notificado.");
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
              <Select value={empresa} onChange={(e) => setEmpresa(e.target.value)}>
                <option value="">Sin especificar</option>
                {EMPRESAS_ENCOMIENDA.map((nombre) => (
                  <option key={nombre} value={nombre}>
                    {nombre}
                  </option>
                ))}
                <option value="OTRO">Otro...</option>
              </Select>
            </div>
            {esOtro && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
                <Label>Especifica el remitente</Label>
                <Input
                  autoFocus
                  value={otroRemitente}
                  onChange={(e) => setOtroRemitente(e.target.value)}
                  placeholder="Ej: Amazon, tienda local, particular..."
                />
              </motion.div>
            )}
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
            <EmptyState icon={Package} title="No hay encomiendas pendientes" />
          ) : (
            <div className="divide-y divide-slate-50">
              {pendientes.map((enc, i) => (
                <motion.div key={enc.id} {...staggerFade(i)} className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-slate-50/70">
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
                        toast.success("Encomienda marcada como retirada.");
                        recargar();
                      }}
                    >
                      Marcar retirada
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
