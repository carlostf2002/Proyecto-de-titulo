import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { signAuthToken } from "../../lib/jwt";
import { UnauthorizedError, ForbiddenError } from "../../lib/errors";

const SALT_ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function login(email: string, password: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email: email.toLowerCase().trim() } });

  // HU-01: si las credenciales son incorrectas, se informa con un mensaje generico
  // (no se revela si el correo existe o no).
  if (!usuario) {
    throw new UnauthorizedError("Correo o contrasena incorrectos.");
  }

  const valido = await bcrypt.compare(password, usuario.passwordHash);
  if (!valido) {
    throw new UnauthorizedError("Correo o contrasena incorrectos.");
  }

  if (!usuario.activo) {
    throw new ForbiddenError("Tu cuenta se encuentra deshabilitada. Contacta a la administracion.");
  }

  const token = signAuthToken({ sub: usuario.id, rol: usuario.rol, condominioId: usuario.condominioId });

  return {
    token,
    usuario: {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
      condominioId: usuario.condominioId,
      departamentoId: usuario.departamentoId,
    },
  };
}

export async function getPerfil(usuarioId: string) {
  const usuario = await prisma.usuario.findUniqueOrThrow({
    where: { id: usuarioId },
    select: {
      id: true,
      email: true,
      nombre: true,
      apellido: true,
      rol: true,
      condominioId: true,
      departamentoId: true,
      telefono: true,
      condominio: { select: { id: true, nombre: true } },
      departamento: { select: { id: true, numero: true, torre: { select: { nombre: true } } } },
    },
  });
  return usuario;
}
