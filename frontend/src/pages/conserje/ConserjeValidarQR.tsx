import { FormEvent, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { qrApi } from "../../api/endpoints";
import { Alert, Button, Card, CardHeader, Input, Label } from "../../components/ui";
import { mensajeError } from "../../api/client";

type Resultado = { resultado: "AUTORIZADO" | "RECHAZADO"; motivo: string; detalle?: Record<string, unknown> };

const READER_ID = "qr-reader";

export default function ConserjeValidarQR() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const procesandoRef = useRef(false);
  const [escaneando, setEscaneando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [errorCamara, setErrorCamara] = useState<string | null>(null);
  const [tokenManual, setTokenManual] = useState("");
  const [validandoManual, setValidandoManual] = useState(false);

  async function validarToken(token: string) {
    if (procesandoRef.current) return;
    procesandoRef.current = true;
    try {
      const res = await qrApi.validar(token);
      setResultado(res);
    } catch (err) {
      setResultado({ resultado: "RECHAZADO", motivo: mensajeError(err, "No se pudo validar el codigo.") });
    } finally {
      procesandoRef.current = false;
    }
  }

  async function iniciarCamara() {
    setErrorCamara(null);
    setResultado(null);
    try {
      const scanner = new Html5Qrcode(READER_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          await validarToken(decodedText);
          await detenerCamara();
        },
        () => {
          // errores de lectura frame a frame, se ignoran (es normal mientras se enfoca)
        }
      );
      setEscaneando(true);
    } catch {
      setErrorCamara("No se pudo acceder a la camara. Usa la validacion manual mas abajo.");
    }
  }

  async function detenerCamara() {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        await scanner.stop();
        await scanner.clear();
      } catch {
        // ignorar si ya estaba detenido
      }
    }
    scannerRef.current = null;
    setEscaneando(false);
  }

  useEffect(() => {
    return () => {
      detenerCamara();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleManualSubmit(e: FormEvent) {
    e.preventDefault();
    setValidandoManual(true);
    try {
      await validarToken(tokenManual.trim());
      setTokenManual("");
    } finally {
      setValidandoManual(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Validar acceso QR</h1>
        <p className="text-sm text-slate-500">Escanea el codigo de un residente o una visita (HU-18, HU-21).</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Escaner de camara" />
          <div className="space-y-3 p-5">
            <div id={READER_ID} className="mx-auto w-full max-w-xs overflow-hidden rounded-lg bg-slate-900" />
            {errorCamara && <Alert tone="amber">{errorCamara}</Alert>}
            <Button className="w-full" variant={escaneando ? "secondary" : "primary"} onClick={escaneando ? detenerCamara : iniciarCamara}>
              {escaneando ? "Detener escaner" : "Iniciar escaner"}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Validacion manual" subtitle="Si no hay camara disponible, pega el codigo QR" />
          <form onSubmit={handleManualSubmit} className="space-y-3 p-5">
            <div>
              <Label>Codigo</Label>
              <Input value={tokenManual} onChange={(e) => setTokenManual(e.target.value)} placeholder="Pega el contenido del QR" />
            </div>
            <Button type="submit" className="w-full" loading={validandoManual} disabled={!tokenManual.trim()}>
              Validar
            </Button>
          </form>

          {resultado && (
            <div className="border-t border-slate-100 p-5">
              <div
                className={
                  resultado.resultado === "AUTORIZADO"
                    ? "rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center"
                    : "rounded-lg border border-red-200 bg-red-50 p-4 text-center"
                }
              >
                <p className={resultado.resultado === "AUTORIZADO" ? "text-lg font-bold text-emerald-700" : "text-lg font-bold text-red-700"}>
                  {resultado.resultado === "AUTORIZADO" ? "✓ Acceso autorizado" : "✗ Acceso rechazado"}
                </p>
                <p className="mt-1 text-sm text-slate-600">{resultado.motivo}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
