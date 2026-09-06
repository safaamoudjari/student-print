import { Request, Response } from 'express';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { OrderFile } from '../models/OrderFile';
import { Order } from '../models/Order';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

// Downloads are always streamed through this authenticated endpoint rather
// than served from a public /uploads folder, so a file's URL alone is never
// enough to access it — the requester must be the owning student or an
// admin.
export const downloadFile = asyncHandler(async (req: Request, res: Response) => {
  const file = await OrderFile.findById(req.params.id).select('+storagePath');
  if (!file) throw new AppError('File not found.', 404);

  const order = await Order.findById(file.orderId);
  if (!order) throw new AppError('File not found.', 404);

  const isOwner = order.studentId.toString() === req.user!._id.toString();
  const isAdmin = req.user!.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new AppError('You do not have permission to access this file.', 403);
  }

  if (!fs.existsSync(file.storagePath)) {
    throw new AppError('This file is no longer available.', 404);
  }

  res.download(file.storagePath, file.originalFileName);
});

export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const file = await OrderFile.findById(req.params.id).select('+storagePath');
  if (!file) throw new AppError('File not found.', 404);

  const order = await Order.findById(file.orderId);
  if (!order) throw new AppError('File not found.', 404);

  const isOwner = order.studentId.toString() === req.user!._id.toString();
  const isAdmin = req.user!.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new AppError('You do not have permission to delete this file.', 403);
  }

  if (isOwner && !isAdmin && !['pending'].includes(order.status)) {
    throw new AppError('Files can only be removed while the order is still pending.', 400);
  }

  await fsPromises.unlink(file.storagePath).catch(() => undefined);
  await file.deleteOne();

  res.json({ message: 'File deleted.' });
});
