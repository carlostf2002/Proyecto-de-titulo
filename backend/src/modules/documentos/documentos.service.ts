import { prisma } from "../../lib/prisma";
import { NotFoundError } from "../../lib/errors";

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

export async function eliminarDocumento(condominioId: string, documentoId: string) {
  const { count } = await prisma.documento.deleteMany({ where: { id: documentoId, condominioId } });
  if (count === 0) throw new NotFoundError("Documento no encontrado.");
}
