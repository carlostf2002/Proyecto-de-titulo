import { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import clsx from "clsx";
import { CheckCircle, Icon as PhosphorIcon, MagnifyingGlass, Tray, Warning, WarningCircle, X } from "@phosphor-icons/react";

// Animacion de entrada escalonada para filas de tabla / items de lista.
// Uso: data.map((item, i) => <motion.tr key={item.id} {...staggerFade(i)}>...</motion.tr>)
export function staggerFade(index: number) {
  return {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, delay: Math.min(index * 0.04, 0.4) },
  };
}

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  children,
  ...props
}: NativeButtonProps & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: props.disabled || loading ? 1 : 0.97 }}
      transition={{ duration: 0.1 }}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:cursor-not-allowed disabled:opacity-60",
        size === "md" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs",
        variant === "primary" && "bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/30",
        variant === "secondary" && "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700",
        variant === "danger" && "bg-red-600 text-white shadow-sm shadow-red-600/20 hover:bg-red-700",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </motion.button>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={clsx("rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow dark:border-slate-700 dark:bg-slate-800", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-700/60">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={clsx("relative", className)}>
      <MagnifyingGlass size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-shadow focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
    </div>
  );
}

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: PhosphorIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <Icon size={22} weight="duotone" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </motion.div>
  );
}

const STAT_TONES: Record<string, { bg: string; text: string }> = {
  slate: { bg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-300" },
  brand: { bg: "bg-brand-50 dark:bg-brand-500/15", text: "text-brand-600 dark:text-brand-300" },
  green: { bg: "bg-emerald-50 dark:bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-300" },
  amber: { bg: "bg-amber-50 dark:bg-amber-500/15", text: "text-amber-600 dark:text-amber-300" },
  red: { bg: "bg-red-50 dark:bg-red-500/15", text: "text-red-600 dark:text-red-300" },
  purple: { bg: "bg-purple-50 dark:bg-purple-500/15", text: "text-purple-600 dark:text-purple-300" },
};

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState("0");
  const rounded = useTransform(motionValue, (v) => Math.round(v).toLocaleString("es-CL"));

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.7, ease: "easeOut" });
    const unsubscribe = rounded.on("change", setDisplay);
    return () => {
      controls.stop();
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display}</>;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "brand",
  index = 0,
  to,
}: {
  icon: PhosphorIcon;
  label: string;
  value: number;
  tone?: keyof typeof STAT_TONES;
  index?: number;
  to?: string;
}) {
  const colors = STAT_TONES[tone];
  const contenido = (
    <>
      <div className="flex items-center gap-3">
        <div className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", colors.bg, colors.text)}>
          <Icon size={20} weight="bold" />
        </div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
        <AnimatedNumber value={value} />
      </p>
    </>
  );

  const className = clsx(
    "block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800",
    to && "hover:border-brand-300 dark:hover:border-brand-500/50"
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
      {to ? (
        <Link to={to} className={className}>
          {contenido}
        </Link>
      ) : (
        <div className={className}>{contenido}</div>
      )}
    </motion.div>
  );
}

// --- Graficos (HU-24): barras horizontales con spec fijo (grosor <=24px, extremo
// redondeado 4px, gap de 2px entre marcas, valor directo en la punta) y un medidor
// para razones simples (autorizados vs rechazados), siguiendo la skill de dataviz.

export interface BarChartItem {
  label: string;
  value: number;
  color: string;
}

export function HorizontalBarChart({ items }: { items: BarChartItem[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-2.5 p-5">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 truncate text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
          <div className="h-[10px] flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.06 }}
              className="h-full rounded-full"
              style={{ backgroundColor: item.color }}
            />
          </div>
          <span className="w-6 shrink-0 text-right text-xs font-semibold text-slate-700 dark:text-slate-200">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Meter({
  label,
  value,
  total,
  color = "#0ca30c",
}: {
  label: string;
  value: number;
  total: number;
  color?: string;
}) {
  const porcentaje = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="p-5">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {value} / {total} · {porcentaje}%
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${porcentaje}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300" {...props} />;
}

const CAMPO_CLASES =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-shadow focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(CAMPO_CLASES, className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(CAMPO_CLASES, className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={clsx(CAMPO_CLASES, className)} {...props}>
      {children}
    </select>
  );
}

const BADGE_TONES: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
};

export function Badge({ tone = "slate", children }: { tone?: keyof typeof BADGE_TONES; children: ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", BADGE_TONES[tone])}>
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  icon: Icon = Tray,
}: {
  title: string;
  description?: string;
  icon?: PhosphorIcon;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-2 py-12 text-center"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500">
        <Icon size={22} />
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
    </motion.div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={clsx("flex items-center justify-center py-10", className)}>
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  );
}

const ALERT_ICON = {
  red: WarningCircle,
  green: CheckCircle,
  amber: Warning,
};

export function Alert({ tone = "red", children }: { tone?: "red" | "green" | "amber"; children: ReactNode }) {
  const tones = {
    red: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
    amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  };
  const Icon = ALERT_ICON[tone];
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx("flex items-start gap-2 rounded-lg border px-3 py-2 text-sm", tones[tone])}
    >
      <Icon size={18} weight="fill" className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </motion.div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 dark:bg-black/60"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700/60">
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
