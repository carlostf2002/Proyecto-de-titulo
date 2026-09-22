import { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import clsx from "clsx";
import { CheckCircle, Icon as PhosphorIcon, Tray, Warning, WarningCircle, X } from "@phosphor-icons/react";

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
        variant === "secondary" && "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
        variant === "danger" && "bg-red-600 text-white shadow-sm shadow-red-600/20 hover:bg-red-700",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100",
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
    <div className={clsx("rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action}
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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon size={22} weight="duotone" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </motion.div>
  );
}

const STAT_TONES: Record<string, { bg: string; text: string }> = {
  slate: { bg: "bg-slate-100", text: "text-slate-600" },
  brand: { bg: "bg-brand-50", text: "text-brand-600" },
  green: { bg: "bg-emerald-50", text: "text-emerald-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600" },
  red: { bg: "bg-red-50", text: "text-red-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-600" },
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
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">
        <AnimatedNumber value={value} />
      </p>
    </>
  );

  const className = clsx(
    "block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
    to && "hover:border-brand-300"
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

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="mb-1 block text-xs font-medium text-slate-600" {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-shadow focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-shadow focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-shadow focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

const BADGE_TONES: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700",
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  purple: "bg-purple-100 text-purple-700",
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
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={22} />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && <p className="text-xs text-slate-500">{description}</p>}
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
    red: "bg-red-50 text-red-700 border-red-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="font-display text-sm font-semibold text-slate-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
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
