import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Rol } from "../types";
import { Spinner } from "./ui";

export function ProtectedRoute({ roles, children }: { roles?: Rol[]; children: React.ReactNode }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
