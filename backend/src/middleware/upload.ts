import fs from "fs";
import path from "path";
import multer from "multer";
import { v4 as uuid } from "uuid";
import { AppError } from "../lib/errors";

export const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const TIPOS_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!TIPOS_PERMITIDOS.has(file.mimetype)) {
      cb(new AppError("Tipo de archivo no permitido. Usa JPG, PNG, WEBP o PDF.", 422));
      return;
    }
    cb(null, true);
  },
});

export function archivoUrl(filename: string): string {
  return `/uploads/${filename}`;
}
