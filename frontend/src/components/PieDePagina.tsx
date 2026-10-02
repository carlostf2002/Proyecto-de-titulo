import clsx from "clsx";
import { Buildings } from "@phosphor-icons/react";

export function PieDePagina({ sobreOscuro = false, className }: { sobreOscuro?: boolean; className?: string }) {
  return (
    <footer
      className={clsx(
        "flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-center text-xs",
        sobreOscuro ? "text-white/60" : "text-slate-400 dark:text-slate-500",
        className
      )}
    >
      <Buildings size={13} weight="fill" aria-hidden className={sobreOscuro ? "text-white/50" : "text-brand-400"} />
      <span>© {new Date().getFullYear()} HabitaSmart.</span>
      <span>Todos los derechos reservados.</span>
    </footer>
  );
}
