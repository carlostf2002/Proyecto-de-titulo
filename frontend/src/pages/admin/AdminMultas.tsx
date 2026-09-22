import { FormEvent, useState } from "react";
import { Plus, Warning } from "@phosphor-icons/react";
import { multasApi, usuariosApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Alert, Badge, Button, Card, CardHeader, EmptyState, Input, Label, Modal, PageHeader, Select, Spinner, Textarea } from "../../components/ui";
import { formatFecha, formatMonto } from "../../lib/format";
import { ESTADO_MULTA_TONO } from "../../lib/badges";
import { mensajeError } from "../../api/client";
import type { EstadoMulta } from "../../types";

const ESTADOS: EstadoMulta[] = ["PENDIENTE", "PAGADA", "APELADA", "ANULADA"];

export default function AdminMultas() {
  const { data, cargando, error, recargar } = useAsync(() => multasApi.listarTodas(), []);
  const { data: residentes } = useAsync(() => usuariosApi.listar({ rol: "RESIDENTE" }), []);
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Warning}
        title="Multas"
        subtitle="Registro y seguimiento de sanciones (HU-06, HU-07)."
        action={
          <Button onClick={() => setModalAbierto(true)}>
            <Plus size={16} weight="bold" /> Registrar multa
          </Button>
        }
      />

      <Card>
        {cargando ? (
          <Spinner />
        ) : error ? (
          <Alert tone="red">{error}</Alert>
        ) : !data?.length ? (
          <EmptyState title="Aun no hay multas registradas" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Residente</th>
                  <th className="px-5 py-3">Motivo</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Monto</th>
                  <th className="px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {m.usuario ? `${m.usuario.nombre} ${m.usuario.apellido}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{m.motivo}</td>
                    <td className="px-5 py-3 text-slate-500">{formatFecha(m.fecha)}</td>
                    <td className="px-5 py-3 text-slate-500">{formatMonto(m.monto)}</td>
                    <td className="px-5 py-3">
                      <Select
                        className="w-36"
                        value={m.estado}
                        onChange={async (e) => {
                          await multasApi.actualizar(m.id, { estado: e.target.value });
                          recargar();
                        }}
                      >
                        {ESTADOS.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalAbierto} onClose={() => setModalAbierto(false)} title="Registrar multa">
        <FormularioMulta
          residentes={residentes ?? []}
          onCreado={() => {
            setModalAbierto(false);
            recargar();
          }}
        />
      </Modal>
    </div>
  );
}

function FormularioMulta({
  residentes,
  onCreado,
}: {
  residentes: { id: string; nombre: string; apellido: string }[];
  onCreado: () => void;
}) {
  const [usuarioId, setUsuarioId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await multasApi.crear({ usuarioId, motivo, fecha, monto: Number(monto), observaciones: observaciones || undefined });
      onCreado();
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Residente</Label>
        <Select required value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
          <option value="">Selecciona un residente</option>
          {residentes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre} {r.apellido}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>Motivo</Label>
        <Input required value={motivo} onChange={(e) => setMotivo(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Fecha</Label>
          <Input type="date" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div>
          <Label>Monto (CLP)</Label>
          <Input type="number" min={1} required value={monto} onChange={(e) => setMonto(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Observaciones</Label>
        <Textarea rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
      </div>
      {error && <Alert tone="red">{error}</Alert>}
      <Button type="submit" className="w-full" loading={cargando}>
        Registrar multa
      </Button>
    </form>
  );
}
