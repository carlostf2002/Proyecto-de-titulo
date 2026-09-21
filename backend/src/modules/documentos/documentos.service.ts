import { prisma } from "../../lib/prisma";

// HU-22: publicar documentos.
export async function crearDocumento(
  condominioId: string,
  subidoPorId: string,
  data: { titulo: string; categoria?: string; archivoUrl: string }
) {
  return prisma.documento.create({ data: { condominioId, subidoPorId, ...data } });
}

// HU-23: consultar documentos.
export async function listarDocumentos(condominioId: string) {
  return prisma.documento.findMany({
    where: { condominioId },
    orderBy: { createdAt: "desc" },
  });
}
