import { Buildings, UserCircle } from "@phosphor-icons/react";
import type { Usuario } from "../types";
import { formatFechaHora } from "../lib/format";

const ROL_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  RESIDENTE: "Residente",
  CONSERJE: "Conserje",
};

// Credencial digital del residente (inspirada en carnets tipo estudiantil):
// foto + datos + el QR real que ya usa conserjeria para autorizar el acceso.
// Se muestra la foto que el propio usuario subio en su perfil; si no subio
// ninguna, un placeholder generico en vez de dejar el espacio vacio.
export function CredencialResidente({ usuario, qrDataUrl, expiraEn }: { usuario: Usuario; qrDataUrl: string; expiraEn: string }) {
  const unidad = usuario.departamento
    ? `${usuario.departamento.torre?.nombre ?? ""} ${usuario.departamento.numero}`.trim()
    : null;

  return (
    <div className="relative mx-auto w-full max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-brand-50 shadow-xl dark:border-slate-700 dark:bg-slate-800">
      {/* Franja lateral de acento, con los colores de marca */}
      <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-b from-brand-600 to-accent-600" />

      <div className="flex items-center gap-2 border-b border-slate-200/70 px-5 py-3 pr-11 dark:border-slate-700/70">
        <Buildings size={18} weight="duotone" className="text-brand-600 dark:text-brand-300" />
        <div>
          <p className="font-display text-xs font-bold leading-none text-slate-900 dark:text-white">HabitaSmart</p>
          {usuario.condominio && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{usuario.condominio.nombre}</p>
          )}
        </div>
      </div>

      <div className="relative px-5 pb-5 pr-11 pt-4">
        <div className="absolute right-11 top-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md dark:border-slate-800 dark:bg-slate-700">
          {usuario.fotoUrl ? (
            <img src={usuario.fotoUrl} alt="Foto" className="h-full w-full object-cover" />
          ) : (
            <UserCircle size={44} className="text-slate-400 dark:text-slate-500" />
          )}
        </div>

        <div className="max-w-[60%] space-y-1">
          <p className="font-display text-lg font-bold leading-tight text-slate-900 dark:text-white">
            {usuario.nombre} {usuario.apellido}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{ROL_LABEL[usuario.rol]}</p>
          {unidad && <p className="text-xs text-slate-500 dark:text-slate-400">{unidad}</p>}
        </div>

        <div className="mt-5 flex justify-center">
          <div className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-600">
            <img src={qrDataUrl} alt="Código QR de acceso" className="h-36 w-36" />
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
          Válido hasta {formatFechaHora(expiraEn)}
        </p>
      </div>
    </div>
  );
}
