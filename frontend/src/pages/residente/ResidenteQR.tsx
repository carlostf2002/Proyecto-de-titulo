import { FormEvent, useState } from "react";
import { qrApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Input,
  Label,
  Modal,
  Spinner,
  Textarea,
} from "../../components/ui";
import { formatFechaHora } from "../../lib/format";
import { ESTADO_VISITA_TONO } from "../../lib/badges";
import { mensajeError } from "../../api/client";

export default function ResidenteQR() {
  const [qrResidente, setQrResidente] = useState<{ qrDataUrl: string; expiraEn: string } | null>(null);
  const [generando, setGenerando] = useState(false);
  const [errorQr, setErrorQr] = useState<string | null>(null);

  const { data: visitas, cargando, error, recargar } = useAsync(() => qrApi.misVisitas(), []);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [visitaQr, setVisitaQr] = useState<{ nombre: string; qrDataUrl: string; expiraEn: string } | null>(null);

  async function generarQrResidente() {
    setErrorQr(null);
    setGenerando(true);
    try {
      const res = await qrApi.generarQrResidente();
      setQrResidente(res);
    } catch (err) {
      setErrorQr(mensajeError(err));
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Mi QR y visitas</h1>
        <p className="text-sm text-slate-500">
          Identificacion digital y autorizacion de visitas (HU-17, HU-19, HU-20).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="h-fit">
          <CardHeader title="Mi codigo QR de residente" subtitle="Validalo en conserjeria para tu ingreso" />
          <div className="flex flex-col items-center gap-3 p-5">
            {qrResidente ? (
              <>
                <img src={qrResidente.qrDataUrl} alt="QR de residente" className="h-48 w-48" />
                <p className="text-xs text-slate-500">Vigente hasta {formatFechaHora(qrResidente.expiraEn)}</p>
              </>
            ) : (
              <p className="text-center text-xs text-slate-400">
                Genera tu codigo QR personal. Se renueva periodicamente por seguridad (RNF-08).
              </p>
            )}
            {errorQr && <Alert tone="red">{errorQr}</Alert>}
            <Button onClick={generarQrResidente} loading={generando} className="w-full">
              {qrResidente ? "Regenerar QR" : "Generar mi QR"}
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Visitas autorizadas"
            action={<Button size="sm" onClick={() => setModalAbierto(true)}>+ Registrar visita</Button>}
          />
          {cargando ? (
            <Spinner />
          ) : error ? (
            <Alert tone="red">{error}</Alert>
          ) : !visitas?.length ? (
            <EmptyState title="Aun no has registrado visitas" />
          ) : (
            <div className="divide-y divide-slate-50">
              {visitas.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{v.nombreVisita}</p>
                    <p className="text-xs text-slate-500">
                      {formatFechaHora(v.periodoInicio)} — {formatFechaHora(v.periodoFin)}
                      {v.soloUnUso ? " · Uso unico" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={ESTADO_VISITA_TONO[v.estado]}>{v.estado}</Badge>
                    {v.estado === "VIGENTE" && !v.qrToken && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          const res = await qrApi.generarQrVisita(v.id);
                          setVisitaQr({ nombre: v.nombreVisita, ...res });
                          recargar();
                        }}
                      >
                        Generar QR
                      </Button>
                    )}
                    {v.estado === "VIGENTE" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          await qrApi.revocarVisita(v.id);
                          recargar();
                        }}
                      >
                        Revocar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal open={modalAbierto} onClose={() => setModalAbierto(false)} title="Registrar visita">
        <FormularioVisita
          onCreado={() => {
            setModalAbierto(false);
            recargar();
          }}
        />
      </Modal>

      <Modal open={!!visitaQr} onClose={() => setVisitaQr(null)} title={`QR de ${visitaQr?.nombre ?? ""}`}>
        {visitaQr && (
          <div className="flex flex-col items-center gap-3">
            <img src={visitaQr.qrDataUrl} alt="QR de visita" className="h-56 w-56" />
            <p className="text-xs text-slate-500">Vigente hasta {formatFechaHora(visitaQr.expiraEn)}</p>
            <p className="text-center text-xs text-slate-400">
              Comparte este codigo con tu visita. El conserje lo validara al ingreso.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function FormularioVisita({ onCreado }: { onCreado: () => void }) {
  const [nombreVisita, setNombreVisita] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("20:00");
  const [observaciones, setObservaciones] = useState("");
  const [soloUnUso, setSoloUnUso] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const periodoInicio = new Date(`${fecha}T${horaInicio}:00`).toISOString();
      const periodoFin = new Date(`${fecha}T${horaFin}:00`).toISOString();
      await qrApi.crearVisita({ nombreVisita, fecha, periodoInicio, periodoFin, observaciones: observaciones || undefined, soloUnUso });
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
        <Label>Nombre de la visita</Label>
        <Input required value={nombreVisita} onChange={(e) => setNombreVisita(e.target.value)} />
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
      <div>
        <Label>Observaciones</Label>
        <Textarea rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={soloUnUso} onChange={(e) => setSoloUnUso(e.target.checked)} />
        Autorizacion de un solo uso
      </label>
      {error && <Alert tone="red">{error}</Alert>}
      <Button type="submit" className="w-full" loading={cargando}>
        Registrar visita
      </Button>
    </form>
  );
}
