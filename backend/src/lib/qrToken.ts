import jwt from "jsonwebtoken";
import { env } from "../config/env";

// RFC 7519 (JWT): el claim "exp" limita la vigencia del codigo QR (RNF-08).
// El payload solo contiene el identificador interno (jti) del registro QrToken,
// nunca datos personales del residente o de la visita (RNF-09).
interface QrJwtPayload {
  jti: string;
  tipo: "RESIDENTE" | "VISITA";
}

export function signQrToken(jti: string, tipo: "RESIDENTE" | "VISITA", expiraEn: Date): string {
  const segundosRestantes = Math.max(1, Math.floor((expiraEn.getTime() - Date.now()) / 1000));
  return jwt.sign({ jti, tipo } satisfies QrJwtPayload, env.qrTokenSecret, {
    expiresIn: segundosRestantes,
  });
}

export function verifyQrToken(token: string): QrJwtPayload {
  return jwt.verify(token, env.qrTokenSecret) as QrJwtPayload;
}
