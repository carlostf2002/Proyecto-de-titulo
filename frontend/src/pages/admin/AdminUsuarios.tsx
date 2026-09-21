import { FormEvent, useState } from "react";
import { condominioApi, usuariosApi } from "../../api/endpoints";
import { useAsync } from "../../hooks/useAsync";
import { Alert, Badge, Button, Card, CardHeader, EmptyState, Input, Label, Modal, Select, Spinner } from "../../components/ui";
import { mensajeError } from "../../api/client";
import type { Rol } from "../../types";

const ROL_LABEL: Record<Rol, string> = { ADMIN: "Administrador", RESIDENTE: "Residente", CONSERJE: "Conserje" };

export default function AdminUsuarios() {
  const { data: usuarios, cargando, error, recargar } = useAsync(() => usuariosApi.listar(), []);
  const { data: departamentos } = useAsync(() => condominioApi.listarDepartamentos(), []);
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Residentes y usuarios</h1>
          <p className="text-sm text-slate-500">Registro y administracion de residentes (HU-02).</p>
        </div>
        <Button onClick={() => setModalAbierto(true)}>+ Nuevo usuario</Button>
      </div>

      <Card>
        {cargando ? (
          <Spinner />
        ) : error ? (
          <Alert tone="red">{error}</Alert>
        ) : !usuarios?.length ? (
          <EmptyState title="Aun no hay usuarios registrados" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">Correo</th>
                  <th className="px-5 py-3">Rol</th>
                  <th className="px-5 py-3">Unidad</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {u.nombre} {u.apellido}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <Badge tone="blue">{ROL_LABEL[u.rol]}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {u.departamento ? `${u.departamento.torre?.nombre ?? ""} ${u.departamento.numero}` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={u.activo ? "green" : "slate"}>{u.activo ? "Activo" : "Deshabilitado"}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          await usuariosApi.actualizar(u.id, { activo: !u.activo });
                          recargar();
                        }}
                      >
                        {u.activo ? "Deshabilitar" : "Habilitar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalAbierto} onClose={() => setModalAbierto(false)} title="Registrar usuario">
        <FormularioUsuario
          departamentos={departamentos ?? []}
          onCreado={() => {
            setModalAbierto(false);
            recargar();
          }}
        />
      </Modal>
    </div>
  );
}

function FormularioUsuario({
  departamentos,
  onCreado,
}: {
  departamentos: { id: string; numero: string; torre: { nombre: string } | null }[];
  onCreado: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<Rol>("RESIDENTE");
  const [departamentoId, setDepartamentoId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      await usuariosApi.crear({
        nombre,
        apellido,
        email,
        password,
        rol,
        departamentoId: rol === "RESIDENTE" ? departamentoId || null : null,
      });
      onCreado();
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label>Correo electronico</Label>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label>Contrasena temporal</Label>
        <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <Label>Rol</Label>
        <Select value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
          <option value="RESIDENTE">Residente</option>
          <option value="CONSERJE">Conserje</option>
          <option value="ADMIN">Administrador</option>
        </Select>
      </div>
      {rol === "RESIDENTE" && (
        <div>
          <Label>Unidad</Label>
          <Select value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)}>
            <option value="">Sin asignar</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>
                {d.torre?.nombre ?? ""} {d.numero}
              </option>
            ))}
          </Select>
        </div>
      )}
      {error && <Alert tone="red">{error}</Alert>}
      <Button type="submit" className="w-full" loading={cargando}>
        Registrar usuario
      </Button>
    </form>
  );
}
