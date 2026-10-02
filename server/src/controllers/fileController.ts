import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { OrderFile } from '../models/OrderFile';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { deleteFromCloudinary } from '../config/cloudinary';

// نجيبو الملف ونتأكدو أن المستخدم عندو الحق فيه.
// الطالب: غير ملفات طلباتو. غيره (admin/staff): كل الملفات.
async function loadAuthorizedFile(req: Request) {
  const file = await OrderFile.findById(req.params.id).select(
    '+fileUrl +filePublicId +resourceType'
  );
  if (!file) throw new AppError('This file is no longer available.', 404);

  const order = await Order.findById(file.orderId);
  if (!order) throw new AppError('This file is no longer available.', 404);

  const isStudent = req.user!.role === 'student';
  if (isStudent && order.studentId.toString() !== req.user!._id.toString()) {
    // نرجعو 404 باش ما نكشفوش وجود ملفات الناس الأخرى
    throw new AppError('File not found.', 404);
  }

  if (order.filesDeletedAt) {
    throw new AppError('This file is no longer available.', 410);
  }

  return { file, order, isStudent };
}

export const downloadFile = asyncHandler(async (req: Request, res: Response) => {
  const { file } = await loadAuthorizedFile(req);

  // نجيبو الملف من Cloudinary ونبعثوه بالسمية الأصلية
  const upstream = await fetch(file.fileUrl);
  if (!upstream.ok) {
    throw new AppError('This file is no longer available.', 404);
  }
  const buffer = Buffer.from(await upstream.arrayBuffer());

  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Length', buffer.length.toString());
  res.setHeader(
    'Content-Disposition',
    `attachment; filename*=UTF-8''${encodeURIComponent(file.originalFileName)}`
  );
  res.send(buffer);
});

export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const { file, order, isStudent } = await loadAuthorizedFile(req);

  // الطالب يقدر يمسح ملف غير إذا الطلب مازال pending
  if (isStudent && order.status !== 'pending') {
    throw new AppError('Files can only be removed while the order is pending.', 400);
  }

  // ما نخليوش طلب بلا ملفات
  const count = await OrderFile.countDocuments({ orderId: order._id });
  if (count <= 1) {
    throw new AppError('An order must contain at least one file.', 400);
  }

  await deleteFromCloudinary(file.filePublicId, file.resourceType).catch(() => undefined);
  await file.deleteOne();

  res.json({ message: 'File deleted.' });
});