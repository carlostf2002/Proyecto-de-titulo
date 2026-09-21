import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout, NavItem } from "./layouts/AppLayout";
import Login from "./pages/Login";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminCondominio from "./pages/admin/AdminCondominio";
import AdminReservas from "./pages/admin/AdminReservas";
import AdminMultas from "./pages/admin/AdminMultas";
import AdminIncidencias from "./pages/admin/AdminIncidencias";
import AdminEncomiendas from "./pages/admin/AdminEncomiendas";
import AdminComunicados from "./pages/admin/AdminComunicados";
import AdminDocumentos from "./pages/admin/AdminDocumentos";
import AdminAccesos from "./pages/admin/AdminAccesos";

import ResidenteInicio from "./pages/residente/ResidenteInicio";
import ResidenteReservas from "./pages/residente/ResidenteReservas";
import ResidenteMultas from "./pages/residente/ResidenteMultas";
import ResidenteIncidencias from "./pages/residente/ResidenteIncidencias";
import ResidenteEncomiendas from "./pages/residente/ResidenteEncomiendas";
import ResidenteComunicados from "./pages/residente/ResidenteComunicados";
import ResidenteQR from "./pages/residente/ResidenteQR";
import ResidenteDocumentos from "./pages/residente/ResidenteDocumentos";

import ConserjeEncomiendas from "./pages/conserje/ConserjeEncomiendas";
import ConserjeValidarQR from "./pages/conserje/ConserjeValidarQR";
import ConserjeAccesos from "./pages/conserje/ConserjeAccesos";

const ADMIN_NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/residentes", label: "Residentes", icon: "👥" },
  { to: "/condominio", label: "Condominio", icon: "🏢" },
  { to: "/reservas", label: "Reservas", icon: "📅" },
  { to: "/multas", label: "Multas", icon: "⚠️" },
  { to: "/incidencias", label: "Incidencias", icon: "🛠️" },
  { to: "/encomiendas", label: "Encomiendas", icon: "📦" },
  { to: "/comunicados", label: "Comunicados", icon: "📣" },
  { to: "/documentos", label: "Documentos", icon: "📄" },
  { to: "/accesos", label: "Accesos QR", icon: "🔐" },
];

const RESIDENTE_NAV: NavItem[] = [
  { to: "/", label: "Inicio", icon: "🏠" },
  { to: "/reservas", label: "Reservas", icon: "📅" },
  { to: "/multas", label: "Mis multas", icon: "⚠️" },
  { to: "/incidencias", label: "Incidencias", icon: "🛠️" },
  { to: "/encomiendas", label: "Encomiendas", icon: "📦" },
  { to: "/comunicados", label: "Comunicados", icon: "📣" },
  { to: "/qr", label: "Mi QR y visitas", icon: "🔐" },
  { to: "/documentos", label: "Documentos", icon: "📄" },
];

const CONSERJE_NAV: NavItem[] = [
  { to: "/", label: "Encomiendas", icon: "📦" },
  { to: "/validar", label: "Validar QR", icon: "🔐" },
  { to: "/accesos", label: "Historial de accesos", icon: "🕒" },
];

function AdminApp() {
  return (
    <AppLayout nav={ADMIN_NAV}>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="residentes" element={<AdminUsuarios />} />
        <Route path="condominio" element={<AdminCondominio />} />
        <Route path="reservas" element={<AdminReservas />} />
        <Route path="multas" element={<AdminMultas />} />
        <Route path="incidencias" element={<AdminIncidencias />} />
        <Route path="encomiendas" element={<AdminEncomiendas />} />
        <Route path="comunicados" element={<AdminComunicados />} />
        <Route path="documentos" element={<AdminDocumentos />} />
        <Route path="accesos" element={<AdminAccesos />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

function ResidenteApp() {
  return (
    <AppLayout nav={RESIDENTE_NAV}>
      <Routes>
        <Route index element={<ResidenteInicio />} />
        <Route path="reservas" element={<ResidenteReservas />} />
        <Route path="multas" element={<ResidenteMultas />} />
        <Route path="incidencias" element={<ResidenteIncidencias />} />
        <Route path="encomiendas" element={<ResidenteEncomiendas />} />
        <Route path="comunicados" element={<ResidenteComunicados />} />
        <Route path="qr" element={<ResidenteQR />} />
        <Route path="documentos" element={<ResidenteDocumentos />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

function ConserjeApp() {
  return (
    <AppLayout nav={CONSERJE_NAV}>
      <Routes>
        <Route index element={<ConserjeEncomiendas />} />
        <Route path="validar" element={<ConserjeValidarQR />} />
        <Route path="accesos" element={<ConserjeAccesos />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

function RoleRouter() {
  const { usuario } = useAuth();
  if (!usuario) return null;
  if (usuario.rol === "ADMIN") return <AdminApp />;
  if (usuario.rol === "RESIDENTE") return <ResidenteApp />;
  return <ConserjeApp />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <RoleRouter />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
