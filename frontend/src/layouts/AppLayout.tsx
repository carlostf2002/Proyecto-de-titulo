import { ReactNode, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { Bell, Buildings, List, SignOut, X } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { notificacionesApi } from "../api/endpoints";
import type { Notificacion } from "../types";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const ROL_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  RESIDENTE: "Residente",
  CONSERJE: "Conserje",
};

export function AppLayout({ nav, children }: { nav: NavItem[]; children: ReactNode }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  useEffect(() => {
    let activo = true;
    function cargar() {
      notificacionesApi.listar().then((data) => {
        if (activo) setNotificaciones(data);
      }).catch(() => {});
    }
    cargar();
    const intervalo = setInterval(cargar, 30000);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <SidebarContent nav={nav} usuario={usuario} />
      </aside>

      {/* Sidebar movil */}
      <AnimatePresence>
        {menuMovilAbierto && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-900/50"
              onClick={() => setMenuMovilAbierto(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              className="relative flex h-full w-64 flex-col bg-white shadow-xl"
            >
              <button
                className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                onClick={() => setMenuMovilAbierto(false)}
                aria-label="Cerrar menu"
              >
                <X size={18} />
              </button>
              <SidebarContent nav={nav} usuario={usuario} onNavigate={() => setMenuMovilAbierto(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
          <button
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 lg:hidden"
            onClick={() => setMenuMovilAbierto(true)}
            aria-label="Abrir menu"
          >
            <List size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
                onClick={() => setPanelAbierto((v) => !v)}
                aria-label="Notificaciones"
              >
                <motion.span
                  className="block"
                  animate={noLeidas > 0 ? { rotate: [0, -12, 10, -6, 0] } : {}}
                  transition={{ duration: 0.6, repeat: noLeidas > 0 ? Infinity : 0, repeatDelay: 3 }}
                >
                  <Bell size={20} weight={noLeidas > 0 ? "fill" : "regular"} className={noLeidas > 0 ? "text-accent-500" : undefined} />
                </motion.span>
                {noLeidas > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                    {noLeidas > 9 ? "9+" : noLeidas}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {panelAbierto && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <span className="text-sm font-semibold">Notificaciones</span>
                      {noLeidas > 0 && (
                        <button
                          className="text-xs text-brand-600 hover:underline"
                          onClick={() => {
                            notificacionesApi.leerTodas().then(() =>
                              setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
                            );
                          }}
                        >
                          Marcar todas como leidas
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notificaciones.length === 0 ? (
                        <p className="px-4 py-6 text-center text-xs text-slate-400">Sin notificaciones.</p>
                      ) : (
                        notificaciones.map((n) => (
                          <div
                            key={n.id}
                            className={clsx("border-b border-slate-50 px-4 py-3 text-sm", !n.leida && "bg-brand-50/60")}
                          >
                            <p className="font-medium text-slate-800">{n.titulo}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{n.mensaje}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800">
                {usuario?.nombre} {usuario?.apellido}
              </p>
              <p className="text-xs text-slate-500">{usuario && ROL_LABEL[usuario.rol]}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <SignOut size={14} />
              Salir
            </button>
          </div>
        </header>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex-1 p-4 lg:p-8"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

function SidebarContent({
  nav,
  usuario,
  onNavigate,
}: {
  nav: NavItem[];
  usuario: ReturnType<typeof useAuth>["usuario"];
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm shadow-brand-600/30">
          <Buildings size={18} weight="duotone" />
        </div>
        <div>
          <p className="font-display text-sm font-bold leading-none text-slate-900">HabitaSmart</p>
          <p className="text-[11px] text-slate-400">{usuario?.condominioId ? "Gestion de condominios" : ""}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "text-brand-700" : "text-slate-600 hover:bg-slate-50"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-lg bg-brand-50"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
