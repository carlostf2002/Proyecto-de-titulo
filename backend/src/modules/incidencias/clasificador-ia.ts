// HU-25: clasificacion asistida de incidencias.
// Motor de reglas por palabras clave (MVP, sin dependencia de un servicio externo de pago).
// El resultado es SIEMPRE una sugerencia: el administrador debe revisarla y puede modificarla (RNF-14).

import { PrioridadIncidencia } from "@prisma/client";

interface ReglaCategoria {
  categoria: string;
  palabras: string[];
}

const CATEGORIAS: ReglaCategoria[] = [
  { categoria: "Filtracion", palabras: ["filtracion", "fuga de agua", "gotera", "inundacion", "humedad"] },
  { categoria: "Electrico", palabras: ["electrico", "cortocircuito", "chispa", "enchufe", "cable", "luz"] },
  { categoria: "Ascensor", palabras: ["ascensor", "elevador", "atrapado"] },
  { categoria: "Plaga", palabras: ["plaga", "roedor", "rata", "cucaracha", "insecto"] },
  { categoria: "Seguridad", palabras: ["robo", "intruso", "camara", "portón", "porton", "cerradura", "seguridad"] },
  { categoria: "Ruido", palabras: ["ruido", "musica", "fiesta", "molestia auditiva"] },
  { categoria: "Estructural", palabras: ["grieta", "estructural", "derrumbe", "techo", "muro"] },
  { categoria: "Limpieza", palabras: ["basura", "suciedad", "limpieza", "olor"] },
];

const PALABRAS_PRIORIDAD_ALTA = [
  "urgente",
  "grande",
  "importante",
  "incendio",
  "gas",
  "peligro",
  "emergencia",
  "grave",
  "riesgo",
  "atrapado",
];

const PALABRAS_PRIORIDAD_BAJA = ["menor", "leve", "pequeña", "pequena", "detalle", "estetico", "estético"];

const UBICACIONES_CONOCIDAS = [
  "estacionamiento",
  "subterraneo",
  "subterráneo",
  "ascensor",
  "pasillo",
  "terraza",
  "piscina",
  "gimnasio",
  "hall",
  "azotea",
  "bodega",
  "quincho",
  "sala de eventos",
  "lavanderia",
  "lavandería",
  "jardin",
  "jardín",
];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export interface SugerenciaIA {
  categoria: string;
  prioridad: PrioridadIncidencia;
  ubicacionDetectada: string | null;
  confianza: "baja" | "media" | "alta";
}

export function sugerirClasificacion(titulo: string, descripcion: string, ubicacionIngresada: string): SugerenciaIA {
  const texto = normalizar(`${titulo} ${descripcion} ${ubicacionIngresada}`);

  let categoria = "Otro";
  let coincidenciasCategoria = 0;
  for (const regla of CATEGORIAS) {
    const matches = regla.palabras.filter((p) => texto.includes(normalizar(p))).length;
    if (matches > coincidenciasCategoria) {
      coincidenciasCategoria = matches;
      categoria = regla.categoria;
    }
  }

  let prioridad: PrioridadIncidencia = PrioridadIncidencia.MEDIA;
  if (PALABRAS_PRIORIDAD_ALTA.some((p) => texto.includes(normalizar(p)))) {
    prioridad = PrioridadIncidencia.ALTA;
  } else if (PALABRAS_PRIORIDAD_BAJA.some((p) => texto.includes(normalizar(p)))) {
    prioridad = PrioridadIncidencia.BAJA;
  }

  const ubicacionDetectada =
    UBICACIONES_CONOCIDAS.find((u) => texto.includes(normalizar(u))) ?? (ubicacionIngresada || null);

  const confianza: SugerenciaIA["confianza"] =
    coincidenciasCategoria >= 2 ? "alta" : coincidenciasCategoria === 1 ? "media" : "baja";

  return { categoria, prioridad, ubicacionDetectada, confianza };
}
