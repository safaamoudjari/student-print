import './env'; // باش يتحمل dotenv قبل ما نقراو process.env
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export interface StoredFile {
  url: string;
  publicId: string;
  resourceType: string;
}

export function uploadToCloudinary(file: Express.Multer.File): Promise<StoredFile> {
  const ext = path.extname(file.originalname).toLowerCase();
  const isRaw = ext === '.doc' || ext === '.docx';
  const randomName = crypto.randomBytes(24).toString('hex');

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: isRaw ? 'raw' : 'auto',
          folder: 'print-orders',
          public_id: isRaw ? `${randomName}${ext}` : randomName,
        },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
          });
        }
      )
      .end(file.buffer);
  });
}

export async function deleteFromCloudinary(publicId: string, resourceType = 'image') {
  const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  // "ok" = deleted, "not found" = already gone (fine). Anything else is a real failure.
  if (res.result !== 'ok' && res.result !== 'not found') {
    throw new Error(`Cloudinary destroy returned "${res.result}"`);
  }
}