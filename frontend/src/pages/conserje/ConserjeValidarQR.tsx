import { FormEvent, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { qrApi } from "../../api/endpoints";
import { QrCode } from "@phosphor-icons/react";
import { Alert, Button, Card, CardHeader, Input, Label, PageHeader } from "../../components/ui";
import { mensajeError } from "../../api/client";

type DepartamentoInfo = { numero: string; torre: { nombre: string } | null } | null;
type PersonaInfo = { id: string; nombre: string; apellido: string; departamento: DepartamentoInfo };
type Resultado = { resultado: "AUTORIZADO" | "RECHAZADO"; motivo: string; detalle?: Record<string, unknown> };

const READER_ID = "qr-reader";

function formatUnidad(departamento: DepartamentoInfo): string | null {
  if (!departamento) return null;
  return `${departamento.torre?.nombre ?? ""} ${departamento.numero}`.trim();
}

// El QR ahora codifica un link (https://.../acceso/<token>) en vez de solo
// el token en texto plano, para que cualquier camara de celular lo reconozca
// como algo abrible. Si lo que se escaneo o pego es ese link, se extrae el
// token de la URL; si ya es el token crudo (compatibilidad con QRs viejos
// generados antes de este cambio), se usa tal cual.
function extraerToken(texto: string): string {
  const limpio = texto.trim();
  try {
    const url = new URL(limpio);
    const partes = url.pathname.split("/").filter(Boolean);
    const idx = partes.indexOf("acceso");
    if (idx !== -1 && partes[idx + 1]) return decodeURIComponent(partes[idx + 1]);
  } catch {
    // No es una URL valida -> se asume que ya es el token.
  }
  return limpio;
}

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
      const res = await qrApi.validar(extraerToken(token));
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
        {
          fps: 10,
          // Caja de lectura como % del video en vez de un tamaño fijo en px:
          // con un tamaño fijo chico (240px) el usuario tenia que acercar
          // demasiado el QR (mas dificil aun si es el QR en la pantalla de
          // otro celular, con brillo/reflejo). Tambien se pide mayor
          // resolucion de camara -- con la resolucion por defecto (bastante
          // baja) la libreria no alcanzaba a leer el detalle del codigo.
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const lado = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.8);
            return { width: lado, height: lado };
          },
          aspectRatio: 1,
          videoConstraints: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        },
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
      <PageHeader icon={QrCode} title="Validar acceso QR" subtitle="Escanea el codigo de un residente o una visita (HU-18, HU-21)." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Escaner de camara" />
          <div className="space-y-3 p-5">
            <div id={READER_ID} className="mx-auto w-full max-w-sm overflow-hidden rounded-lg bg-slate-900" />
            {escaneando && (
              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                Si es el QR en la pantalla de otro celular, sube el brillo y acércalo despacio hasta que quede dentro del recuadro.
              </p>
            )}
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
            <div className="border-t border-slate-100 dark:border-slate-700/60 p-5">
              <div
                className={
                  resultado.resultado === "AUTORIZADO"
                    ? "rounded-lg border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-4 text-center"
                    : "rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4 text-center"
                }
              >
                <p className={resultado.resultado === "AUTORIZADO" ? "text-lg font-bold text-emerald-700 dark:text-emerald-300" : "text-lg font-bold text-red-700 dark:text-red-300"}>
                  {resultado.resultado === "AUTORIZADO" ? "✓ Acceso autorizado" : "✗ Acceso rechazado"}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{resultado.motivo}</p>
                {resultado.detalle && "residente" in resultado.detalle && (
                  <div className="mt-3 rounded-md bg-white/60 p-3 text-left dark:bg-slate-900/30">
                    {(() => {
                      const residente = resultado.detalle!.residente as PersonaInfo;
                      return (
                        <>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {residente.nombre} {residente.apellido}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatUnidad(residente.departamento) || "Sin unidad asignada"}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}
                {resultado.detalle && "visita" in resultado.detalle && (
                  <div className="mt-3 rounded-md bg-white/60 p-3 text-left dark:bg-slate-900/30">
                    {(() => {
                      const visita = resultado.detalle!.visita as {
                        nombreVisita: string;
                        residenteId: string;
                        residente: PersonaInfo | null;
                      };
                      return (
                        <>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            Visita: {visita.nombreVisita}
                          </p>
                          {visita.residente && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Va a {formatUnidad(visita.residente.departamento) || "unidad no asignada"} · Autoriza{" "}
                              {visita.residente.nombre} {visita.residente.apellido}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
