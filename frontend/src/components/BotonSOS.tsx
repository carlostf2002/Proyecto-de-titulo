import { useState } from "react";
import { Fire, FirstAidKit, ShieldCheck, Siren, X } from "@phosphor-icons/react";
import { Modal } from "./ui";
import { sosApi } from "../api/endpoints";
import { useToast } from "../context/ToastContext";
import type { TipoEmergenciaSos } from "../types";

// Boton SOS para residentes: siempre visible (flotante), pensado para una
// emergencia real -- nunca debe quedar escondido en un menu. Al elegir el
// tipo, el telefono del propio residente llama de verdad al numero de
// emergencia (Chile: 133/132/131) via "tel:"; en paralelo se avisa a
// conserjeria/administracion para que puedan asistir (abrir reja, guiar a
// la ambulancia, etc.) -- ese aviso interno es un plus, jamas un
// reemplazo de la llamada real, por eso nunca bloquea ni demora el tel:.
const OPCIONES: {
  tipo: TipoEmergenciaSos;
  numero: string;
  titulo: string;
  descripcion: string;
  icon: typeof ShieldCheck;
  clases: string;
}[] = [
  {
    tipo: "CARABINEROS",
    numero: "133",
    titulo: "Carabineros",
    descripcion: "Robo, violencia o emergencia policial",
    icon: ShieldCheck,
    clases: "bg-blue-600 hover:bg-blue-700",
  },
  {
    tipo: "BOMBEROS",
    numero: "132",
    titulo: "Bomberos",
    descripcion: "Incendio, fuga de gas u otro riesgo",
    icon: Fire,
    clases: "bg-orange-600 hover:bg-orange-700",
  },
  {
    tipo: "AMBULANCIA",
    numero: "131",
    titulo: "Ambulancia (SAMU)",
    descripcion: "Emergencia medica",
    icon: FirstAidKit,
    clases: "bg-emerald-600 hover:bg-emerald-700",
  },
];

export function BotonSOS() {
  const toast = useToast();
  const [abierto, setAbierto] = useState(false);

  function activar(tipo: TipoEmergenciaSos, numero: string) {
    // Fire-and-forget: nunca debe demorar ni bloquear la llamada real.
    sosApi
      .crear(tipo)
      .then(() => toast.info("Se avisó a conserjería y administración."))
      .catch(() => {});
    window.location.href = `tel:${numero}`;
    setAbierto(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Emergencia SOS"
        className="fixed bottom-6 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/40 transition-transform active:scale-95"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-red-600 opacity-75" />
        <Siren size={28} weight="fill" className="relative" />
      </button>

      <Modal open={abierto} onClose={() => setAbierto(false)} title="Emergencia">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Elige el tipo de emergencia. Esto abrirá la llamada real desde tu celular — úsalo solo si es una
            emergencia de verdad.
          </p>

          <div className="space-y-3">
            {OPCIONES.map((op) => (
              <button
                key={op.tipo}
                type="button"
                onClick={() => activar(op.tipo, op.numero)}
                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-white shadow-sm transition-colors ${op.clases}`}
              >
                <op.icon size={28} weight="fill" className="shrink-0" />
                <span className="flex-1">
                  <span className="block text-base font-bold">{op.titulo}</span>
                  <span className="block text-xs text-white/85">{op.descripcion}</span>
                </span>
                <span className="text-2xl font-bold">{op.numero}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setAbierto(false)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <X size={16} />
            Cancelar
          </button>
        </div>
      </Modal>
    </>
  );
}
