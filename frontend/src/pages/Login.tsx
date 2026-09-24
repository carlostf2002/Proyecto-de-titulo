import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Buildings, Envelope, LockKey, ShieldCheck, WarningCircle } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { mensajeError } from "../api/client";
import { Button } from "../components/ui";
import { SkylineBackground } from "../components/SkylineBackground";

export default function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(mensajeError(err, "Correo o contrasena incorrectos."));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <SkylineBackground />

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2">
        {/* Columna de marca (desktop) */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="hidden text-white lg:block"
        >
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
            <Buildings size={30} weight="duotone" className="text-accent-300" />
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight">
            Gestiona tu condominio,
            <br />
            de forma inteligente.
          </h1>
          <p className="mt-4 max-w-md text-sm text-brand-100">
            Comunicacion, reservas, incidencias, multas, encomiendas y control de acceso por
            QR — todo centralizado en una sola plataforma para administradores, residentes y
            conserjeria.
          </p>
          <div className="mt-8 flex items-center gap-2 text-xs text-brand-200">
            <ShieldCheck size={18} weight="fill" className="text-accent-300" />
            Acceso seguro con roles y trazabilidad completa
          </div>
        </motion.div>

        {/* Tarjeta de login (glassmorphism) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="mx-auto w-full max-w-md rounded-2xl border border-white/30 bg-white/90 p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-6 flex flex-col items-center text-center lg:hidden">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
              <Buildings size={24} weight="duotone" />
            </div>
            <h1 className="font-display text-xl font-bold text-slate-900">HabitaSmart</h1>
            <p className="mt-1 text-sm text-slate-500">Gestion integral de condominios</p>
          </div>
          <div className="mb-6 hidden lg:block">
            <h2 className="font-display text-xl font-bold text-slate-900">Bienvenido de nuevo</h2>
            <p className="mt-1 text-sm text-slate-500">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-600">
                Correo electronico
              </label>
              <div className="relative">
                <Envelope size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.cl"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-shadow focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-medium text-slate-600">
                Contrasena
              </label>
              <div className="relative">
                <LockKey size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-shadow focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0" />
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-full" loading={cargando}>
              Iniciar sesion
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            <p className="mb-1 font-medium text-slate-600">Cuentas de demostracion</p>
            <p>admin@habitasmart.cl · residente@habitasmart.cl · conserje@habitasmart.cl</p>
            <p>Contrasena: Habita2026!</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
