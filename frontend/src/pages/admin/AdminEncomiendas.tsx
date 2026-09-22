import { useState } from "react";
import { motion } from "framer-motion";
import { Package } from "@phosphor-icons/react";
import { encomiendasApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Alert, Badge, Card, EmptyState, PageHeader, SearchInput, Select, Spinner, staggerFade } from "../../components/ui";
import { formatFechaHora } from "../../lib/format";
import { ESTADO_ENCOMIENDA_TONO } from "../../lib/badges";
import type { EstadoEncomienda } from "../../types";

const ESTADOS: EstadoEncomienda[] = ["RECIBIDA", "NOTIFICADA", "RETIRADA"];

export default function AdminEncomiendas() {
  const { data, cargando, error } = useAsync(() => encomiendasApi.listarTodas(), []);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoEncomienda | "">("");

  const filtradas = (data ?? []).filter((enc) => {
    const texto = `${enc.usuario?.nombre ?? ""} ${enc.usuario?.apellido ?? ""} ${enc.remitente ?? ""}`.toLowerCase();
    const coincideTexto = !busqueda || texto.includes(busqueda.toLowerCase());
    const coincideEstado = !filtroEstado || enc.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  return (
    <div className="space-y-6">
      <PageHeader icon={Package} title="Encomiendas" subtitle="Visibilidad de encomiendas registradas por conserjeria (HU-12 a HU-14)." />

      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por residente o remitente..."
          className="w-full sm:max-w-xs"
        />
        <Select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoEncomienda | "")}
          className="w-full sm:w-48"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {cargando ? (
          <Spinner />
        ) : error ? (
          <Alert tone="red">{error}</Alert>
        ) : !data?.length ? (
          <EmptyState icon={Package} title="Aun no hay encomiendas registradas" />
        ) : !filtradas.length ? (
          <EmptyState title="Sin resultados" description="Ninguna encomienda coincide con la busqueda." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Residente</th>
                  <th className="px-5 py-3">Remitente</th>
                  <th className="px-5 py-3">Recepcion</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtradas.map((enc, i) => (
                  <motion.tr key={enc.id} {...staggerFade(i)} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {enc.usuario ? `${enc.usuario.nombre} ${enc.usuario.apellido}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{enc.remitente ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-500">{formatFechaHora(enc.fechaRecepcion)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={ESTADO_ENCOMIENDA_TONO[enc.estado]}>{enc.estado}</Badge>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
