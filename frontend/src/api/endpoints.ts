import { api } from "./client";
import type {
  Comunicado,
  Condominio,
  Departamento,
  Documento,
  Encomienda,
  EspacioComun,
  Incidencia,
  Indicadores,
  Multa,
  Notificacion,
  Reserva,
  Rol,
  Torre,
  Usuario,
  Visita,
} from "../types";

// --- Auth ---
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; usuario: Usuario }>("/auth/login", { email, password }).then((r) => r.data),
  me: () => api.get<Usuario>("/auth/me").then((r) => r.data),
};

// --- Usuarios (HU-02) ---
export const usuariosApi = {
  listar: (params?: { rol?: Rol; activo?: boolean }) =>
    api.get<Usuario[]>("/usuarios", { params }).then((r) => r.data),
  crear: (data: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    rol: Rol;
    telefono?: string;
    departamentoId?: string | null;
  }) => api.post<Usuario>("/usuarios", data).then((r) => r.data),
  actualizar: (id: string, data: Partial<Pick<Usuario, "nombre" | "apellido" | "telefono" | "departamentoId" | "activo">>) =>
    api.patch<Usuario>(`/usuarios/${id}`, data).then((r) => r.data),
};

// --- Condominio (HU-03) ---
export const condominioApi = {
  obtener: () => api.get<Condominio>("/condominio").then((r) => r.data),
  actualizar: (data: Partial<Pick<Condominio, "nombre" | "direccion" | "comuna">>) =>
    api.patch<Condominio>("/condominio", data).then((r) => r.data),
  listarTorres: () => api.get<Torre[]>("/condominio/torres").then((r) => r.data),
  crearTorre: (nombre: string) => api.post<Torre>("/condominio/torres", { nombre }).then((r) => r.data),
  listarDepartamentos: () => api.get<Departamento[]>("/condominio/departamentos").then((r) => r.data),
  crearDepartamento: (data: { numero: string; torreId?: string | null }) =>
    api.post<Departamento>("/condominio/departamentos", data).then((r) => r.data),
  listarEspacios: (soloActivos = false) =>
    api.get<EspacioComun[]>("/condominio/espacios-comunes", { params: { activos: soloActivos } }).then((r) => r.data),
  crearEspacio: (data: {
    nombre: string;
    descripcion?: string;
    capacidad?: number;
    horarioInicio: string;
    horarioFin: string;
  }) => api.post<EspacioComun>("/condominio/espacios-comunes", data).then((r) => r.data),
  actualizarEspacio: (id: string, data: Partial<EspacioComun>) =>
    api.patch<EspacioComun>(`/condominio/espacios-comunes/${id}`, data).then((r) => r.data),
};

// --- Reservas (HU-04, HU-05) ---
export const reservasApi = {
  disponibilidad: (espacioComunId: string, fecha: string) =>
    api
      .get<{ espacio: EspacioComun; horariosOcupados: { horaInicio: string; horaFin: string }[] }>(
        "/reservas/disponibilidad",
        { params: { espacioComunId, fecha } }
      )
      .then((r) => r.data),
  crear: (data: { espacioComunId: string; fecha: string; horaInicio: string; horaFin: string }) =>
    api.post<Reserva>("/reservas", data).then((r) => r.data),
  mias: () => api.get<Reserva[]>("/reservas/mias").then((r) => r.data),
  listarTodas: () => api.get<Reserva[]>("/reservas").then((r) => r.data),
  cancelar: (id: string) => api.patch<Reserva>(`/reservas/${id}/cancelar`).then((r) => r.data),
};

// --- Multas (HU-06, HU-07) ---
export const multasApi = {
  crear: (data: { usuarioId: string; motivo: string; fecha: string; monto: number; observaciones?: string }) =>
    api.post<Multa>("/multas", data).then((r) => r.data),
  mias: () => api.get<Multa[]>("/multas/mias").then((r) => r.data),
  listarTodas: (params?: { estado?: string; usuarioId?: string }) =>
    api.get<Multa[]>("/multas", { params }).then((r) => r.data),
  actualizar: (id: string, data: { estado?: string; observaciones?: string }) =>
    api.patch<Multa>(`/multas/${id}`, data).then((r) => r.data),
};

// --- Incidencias (HU-08 a HU-11, HU-25) ---
export const incidenciasApi = {
  crear: (data: FormData) =>
    api.post<Incidencia>("/incidencias", data, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  mias: () => api.get<Incidencia[]>("/incidencias/mias").then((r) => r.data),
  listarTodas: (params?: { estado?: string; prioridad?: string }) =>
    api.get<Incidencia[]>("/incidencias", { params }).then((r) => r.data),
  obtener: (id: string) => api.get<Incidencia>(`/incidencias/${id}`).then((r) => r.data),
  actualizar: (
    id: string,
    data: Partial<{
      estado: string;
      prioridad: string;
      categoria: string;
      responsableId: string | null;
      observacion: string;
    }>
  ) => api.patch<Incidencia>(`/incidencias/${id}`, data).then((r) => r.data),
};

// --- Encomiendas (HU-12 a HU-14) ---
export const encomiendasApi = {
  crear: (data: { usuarioId: string; remitente?: string }) =>
    api.post<Encomienda>("/encomiendas", data).then((r) => r.data),
  mias: () => api.get<Encomienda[]>("/encomiendas/mias").then((r) => r.data),
  listarTodas: (params?: { estado?: string }) =>
    api.get<Encomienda[]>("/encomiendas", { params }).then((r) => r.data),
  marcarRetirada: (id: string) => api.patch<Encomienda>(`/encomiendas/${id}/retirar`).then((r) => r.data),
};

// --- Comunicados (HU-15, HU-16) ---
export const comunicadosApi = {
  crear: (data: { titulo: string; contenido: string; tipo: string }) =>
    api.post<Comunicado>("/comunicados", data).then((r) => r.data),
  listar: () => api.get<Comunicado[]>("/comunicados").then((r) => r.data),
};

// --- QR / Visitas (HU-17 a HU-21) ---
export const qrApi = {
  generarQrResidente: () => api.post<{ qrDataUrl: string; expiraEn: string }>("/qr/residente").then((r) => r.data),
  crearVisita: (data: {
    nombreVisita: string;
    fecha: string;
    periodoInicio: string;
    periodoFin: string;
    observaciones?: string;
    soloUnUso: boolean;
  }) => api.post<Visita>("/qr/visitas", data).then((r) => r.data),
  misVisitas: () => api.get<Visita[]>("/qr/visitas/mias").then((r) => r.data),
  generarQrVisita: (visitaId: string) =>
    api.post<{ qrDataUrl: string; expiraEn: string }>(`/qr/visitas/${visitaId}/qr`).then((r) => r.data),
  revocarVisita: (visitaId: string) => api.patch(`/qr/visitas/${visitaId}/revocar`).then((r) => r.data),
  validar: (token: string) =>
    api
      .post<{ resultado: "AUTORIZADO" | "RECHAZADO"; motivo: string; detalle?: Record<string, unknown> }>(
        "/qr/validar",
        { token }
      )
      .then((r) => r.data),
  accesos: () => api.get("/qr/accesos").then((r) => r.data),
};

// --- Documentos (HU-22, HU-23) ---
export const documentosApi = {
  crear: (data: FormData) =>
    api.post<Documento>("/documentos", data, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  listar: () => api.get<Documento[]>("/documentos").then((r) => r.data),
};

// --- Dashboard (HU-24) ---
export const dashboardApi = {
  indicadores: () => api.get<Indicadores>("/dashboard").then((r) => r.data),
};

// --- Notificaciones ---
export const notificacionesApi = {
  listar: () => api.get<Notificacion[]>("/notificaciones").then((r) => r.data),
  leerTodas: () => api.patch("/notificaciones/leer-todas"),
  leer: (id: string) => api.patch(`/notificaciones/${id}/leer`),
};
