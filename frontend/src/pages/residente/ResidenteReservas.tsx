import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { condominioApi, reservasApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { CalendarBlank } from "@phosphor-icons/react";
import { Alert, Badge, Button, Card, CardHeader, EmptyState, Input, Label, PageHeader, Select, Spinner, staggerFade } from "../../components/ui";
import { formatFecha } from "../../lib/format";
import { ESTADO_RESERVA_TONO } from "../../lib/badges";
import { mensajeError } from "../../api/client";
import { useToast } from "../../context/ToastContext";

export default function ResidenteReservas() {
  const toast = useToast();
  const { data: espacios } = useAsync(() => condominioApi.listarEspacios(true), []);
  const { data: misReservas, cargando: cargandoReservas, recargar: recargarReservas } = useAsync(
    () => reservasApi.mias(),
    []
  );

  const [espacioComunId, setEspacioComunId] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [horaInicio, setHoraInicio] = useState("10:00");
  const [horaFin, setHoraFin] = useState("12:00");
  const [ocupados, setOcupados] = useState<{ horaInicio: string; horaFin: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!espacioComunId || !fecha) return;
    reservasApi.disponibilidad(espacioComunId, fecha).then((res) => setOcupados(res.horariosOcupados));
  }, [espacioComunId, fecha]);

  const espacioSeleccionado = espacios?.find((e) => e.id === espacioComunId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await reservasApi.crear({ espacioComunId, fecha, horaInicio, horaFin });
      toast.success("Reserva confirmada.");
      recargarReservas();
      reservasApi.disponibilidad(espacioComunId, fecha).then((res) => setOcupados(res.horariosOcupados));
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={CalendarBlank} title="Reservar espacios comunes" subtitle="Consulta disponibilidad y reserva (HU-04, HU-05)." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 h-fit">
          <CardHeader title="Nueva reserva" />
          <form onSubmit={handleSubmit} className="space-y-3 p-5">
            <div>
              <Label>Espacio comun</Label>
              <Select required value={espacioComunId} onChange={(e) => setEspacioComunId(e.target.value)}>
                <option value="">Selecciona un espacio</option>
                {espacios?.map((esp) => (
                  <option key={esp.id} value={esp.id}>
                    {esp.nombre} ({esp.horarioInicio} - {esp.horarioFin})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Fecha</Label>
              <Input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Desde</Label>
                <Input type="time" required value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
              </div>
              <div>
                <Label>Hasta</Label>
                <Input type="time" required value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
              </div>
            </div>

            {espacioSeleccionado && (
              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                <p className="mb-1 font-medium">Horarios ya reservados para esa fecha:</p>
                {ocupados.length === 0 ? (
                  <p>Sin reservas para este dia.</p>
                ) : (
                  <ul className="space-y-0.5">
                    {ocupados.map((o, idx) => (
                      <li key={idx}>
                        {o.horaInicio} - {o.horaFin}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {error && <Alert tone="red">{error}</Alert>}

            <Button type="submit" className="w-full" loading={enviando}>
              Confirmar reserva
            </Button>
          </form>
        </Card>

        <Card>
          <CardHeader title="Mis reservas" />
          {cargandoReservas ? (
            <Spinner />
          ) : !misReservas?.length ? (
            <EmptyState title="Aun no tienes reservas" />
          ) : (
            <div className="divide-y divide-slate-50">
              {misReservas.map((r, i) => (
                <motion.div key={r.id} {...staggerFade(i)} className="px-5 py-3 transition-colors hover:bg-slate-50/70">
                  <p className="text-sm font-medium text-slate-800">{r.espacioComun.nombre}</p>
                  <p className="text-xs text-slate-500">
                    {formatFecha(r.fecha)} · {r.horaInicio} - {r.horaFin}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <Badge tone={ESTADO_RESERVA_TONO[r.estado]}>{r.estado}</Badge>
                    {r.estado === "CONFIRMADA" && (
                      <button
                        className="text-xs text-red-600 hover:underline"
                        onClick={async () => {
                          await reservasApi.cancelar(r.id);
                          toast.info("Reserva cancelada.");
                          recargarReservas();
                        }}
                      >
                        Cancelar
                      </button>
                    )}
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
