import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongodbUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/student-print'),
  jwtSecret: required('JWT_SECRET', 'dev-secret-not-for-production'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.COOKIE_NAME || 'sp_token',
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminFirstName: process.env.ADMIN_FIRST_NAME || 'Admin',
  adminLastName: process.env.ADMIN_LAST_NAME || 'Residence',
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads'),
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '20', 10),
  maxFilesPerOrder: parseInt(process.env.MAX_FILES_PER_ORDER || '10', 10),
};
