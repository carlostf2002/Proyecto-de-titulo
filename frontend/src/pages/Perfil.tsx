import { FormEvent, useState } from "react";
import { LockKey, UserCircle } from "@phosphor-icons/react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { authApi } from "../api/endpoints";
import { mensajeError } from "../api/client";
import { Alert, Badge, Button, Card, CardHeader, Input, Label, PageHeader } from "../components/ui";

const ROL_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  RESIDENTE: "Residente",
  CONSERJE: "Conserje",
};

export default function Perfil() {
  const { usuario, actualizarUsuario } = useAuth();
  const toast = useToast();

  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [apellido, setApellido] = useState(usuario?.apellido ?? "");
  const [telefono, setTelefono] = useState(usuario?.telefono ?? "");
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState<string | null>(null);

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmarNueva, setConfirmarNueva] = useState("");
  const [cambiandoPassword, setCambiandoPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);

  if (!usuario) return null;

  async function handleGuardarPerfil(e: FormEvent) {
    e.preventDefault();
    setErrorPerfil(null);
    setGuardandoPerfil(true);
    try {
      const actualizado = await authApi.actualizarPerfil({ nombre, apellido, telefono: telefono || null });
      actualizarUsuario(actualizado);
      toast.success("Perfil actualizado.");
    } catch (err) {
      setErrorPerfil(mensajeError(err));
    } finally {
      setGuardandoPerfil(false);
    }
  }

  async function handleCambiarPassword(e: FormEvent) {
    e.preventDefault();
    setErrorPassword(null);
    if (nueva !== confirmarNueva) {
      setErrorPassword("Las contrasenas nuevas no coinciden.");
      return;
    }
    setCambiandoPassword(true);
    try {
      await authApi.cambiarPassword(actual, nueva);
      setActual("");
      setNueva("");
      setConfirmarNueva("");
      toast.success("Contrasena actualizada.");
    } catch (err) {
      setErrorPassword(mensajeError(err));
    } finally {
      setCambiandoPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={UserCircle} title="Mi perfil" subtitle="Datos de tu cuenta y seguridad." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-fit">
          <CardHeader title="Datos personales" />
          <form onSubmit={handleGuardarPerfil} className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Rol</span>
              <Badge tone="blue">{ROL_LABEL[usuario.rol]}</Badge>
            </div>
            <div>
              <Label>Correo electronico</Label>
              <Input value={usuario.email} disabled className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nombre</Label>
                <Input required value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div>
                <Label>Apellido</Label>
                <Input required value={apellido} onChange={(e) => setApellido(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Telefono</Label>
              <Input value={telefono ?? ""} onChange={(e) => setTelefono(e.target.value)} placeholder="+56 9 1234 5678" />
            </div>
            {errorPerfil && <Alert tone="red">{errorPerfil}</Alert>}
            <Button type="submit" className="w-full" loading={guardandoPerfil}>
              Guardar cambios
            </Button>
          </form>
        </Card>

        <Card className="h-fit">
          <CardHeader title="Cambiar contrasena" subtitle="RNF-02: se almacena mediante hash seguro" />
          <form onSubmit={handleCambiarPassword} className="space-y-4 p-5">
            <div>
              <Label>Contrasena actual</Label>
              <Input
                type="password"
                required
                autoComplete="current-password"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
              />
            </div>
            <div>
              <Label>Nueva contrasena</Label>
              <Input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
              />
            </div>
            <div>
              <Label>Confirmar nueva contrasena</Label>
              <Input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmarNueva}
                onChange={(e) => setConfirmarNueva(e.target.value)}
              />
            </div>
            {errorPassword && <Alert tone="red">{errorPassword}</Alert>}
            <Button type="submit" variant="secondary" className="w-full" loading={cambiandoPassword}>
              <LockKey size={16} /> Actualizar contrasena
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
