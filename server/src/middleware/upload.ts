import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { env } from '../config/env';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']);

if (!fs.existsSync(env.uploadDir)) {
  fs.mkdirSync(env.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.uploadDir);
  },
  filename: (_req, file, cb) => {
    // Never trust the client-supplied filename: generate a random,
    // collision-proof server-side name and keep only a validated
    // extension. This also prevents path traversal via crafted names.
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '';
    const randomName = crypto.randomBytes(24).toString('hex');
    cb(null, `${randomName}${safeExt}`);
  },
});

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase();
  const extOk = ALLOWED_EXTENSIONS.has(ext);
  const mimeOk = ALLOWED_MIME_TYPES.has(file.mimetype);

  // Require both the extension AND the browser-reported MIME type to look
  // legitimate. This is a first line of defense only — it is not a
  // substitute for content sniffing / antivirus scanning in production
  // (see README "File security" notes).
  if (!extOk || !mimeOk) {
    return cb(new Error('UNSUPPORTED_FILE_TYPE'));
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024,
    files: env.maxFilesPerOrder,
  },
});
