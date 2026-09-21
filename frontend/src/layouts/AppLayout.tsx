import { ReactNode, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import clsx from "clsx";
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
      {menuMovilAbierto && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuMovilAbierto(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-white shadow-xl">
            <SidebarContent nav={nav} usuario={usuario} onNavigate={() => setMenuMovilAbierto(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setMenuMovilAbierto(true)}
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                onClick={() => setPanelAbierto((v) => !v)}
                aria-label="Notificaciones"
              >
                🔔
                {noLeidas > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {noLeidas > 9 ? "9+" : noLeidas}
                  </span>
                )}
              </button>
              {panelAbierto && (
                <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
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
                </div>
              )}
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800">
                {usuario?.nombre} {usuario?.apellido}
              </p>
              <p className="text-xs text-slate-500">{usuario && ROL_LABEL[usuario.rol]}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Salir
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
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
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-base font-bold text-white">
          H
        </div>
        <div>
          <p className="text-sm font-bold leading-none text-slate-900">HabitaSmart</p>
          <p className="text-[11px] text-slate-400">{usuario?.condominioId ? "Gestion de condominios" : ""}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
              )
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
