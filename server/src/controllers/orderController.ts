import { Request, Response } from 'express';
import fs from 'fs/promises';
import { z } from 'zod';
import { Order } from '../models/Order';
import { OrderFile } from '../models/OrderFile';
import { Service } from '../models/Service';
import { getSettings } from '../models/Settings';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { detectPageCount } from '../utils/pageCount';
import { calculatePrice } from '../utils/priceCalculator';
import { generateOrderNumber } from '../utils/orderNumber';

const optionsSchema = z.object({
  colorMode: z.enum(['bw', 'color']),
  sides: z.enum(['single', 'double']),
  copies: z.coerce.number().int().min(1),
  services: z.string().optional(), // JSON string: [{ serviceId, quantity }]
  notes: z.string().max(500).optional(),
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];

  // Clean up any files multer already wrote to disk before we bail out on a
  // validation error, so rejected uploads don't pile up on disk.
  const cleanup = async () => {
    await Promise.all(files.map((f) => fs.unlink(f.path).catch(() => undefined)));
  };

  const parsed = optionsSchema.safeParse(req.body);
  if (!parsed.success) {
    await cleanup();
    throw new AppError('Please check your printing options.', 400);
  }
  const { colorMode, sides, copies, notes } = parsed.data;

  if (files.length === 0) {
    throw new AppError('Please upload at least one file.', 400);
  }

  const settings = await getSettings();
  if (files.length > settings.maxFilesPerOrder) {
    await cleanup();
    throw new AppError(`You can upload a maximum of ${settings.maxFilesPerOrder} files per order.`, 400);
  }
  if (copies > settings.maxCopies) {
    await cleanup();
    throw new AppError(`You can request a maximum of ${settings.maxCopies} copies.`, 400);
  }

  let requestedServices: { serviceId: string; quantity: number }[] = [];
  if (parsed.data.services) {
    try {
      requestedServices = JSON.parse(parsed.data.services);
    } catch {
      await cleanup();
      throw new AppError('Invalid additional services selection.', 400);
    }
  }

  // Detect a real page count for each file server-side. Never trust
  // anything the client claims about page counts.
  const pageResults = await Promise.all(
    files.map((file) => detectPageCount(file.path, file.mimetype))
  );
  const totalPages = pageResults.reduce((sum, r) => sum + r.pageCount, 0);

  const allServices = await Service.find({ isActive: true });
  const selectedServices = requestedServices
    .map((rs) => {
      const service = allServices.find((s) => s._id.toString() === rs.serviceId);
      return service ? { service, quantity: Math.max(1, Number(rs.quantity) || 1) } : null;
    })
    .filter((s): s is { service: (typeof allServices)[number]; quantity: number } => s !== null);

  const price = calculatePrice(allServices, {
    totalPages,
    colorMode,
    copies,
    selectedServices,
  });

  const orderNumber = await generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    studentId: req.user!._id,
    status: 'pending',
    colorMode,
    sides,
    copies,
    additionalServices: price.appliedServices.map((s) => ({
      serviceId: s.serviceId,
      name: s.name,
      price: s.price,
      quantity: s.quantity,
    })),
    printingPrice: price.printingPrice,
    servicesPrice: price.servicesPrice,
    totalPrice: price.totalPrice,
    priceBreakdown: price.breakdownLines.join('\n'),
    notes,
  });

  const orderFiles = await OrderFile.insertMany(
    files.map((file, i) => ({
      orderId: order._id,
      originalFileName: file.originalname,
      storedFileName: file.filename,
      storagePath: file.path,
      mimeType: file.mimetype,
      fileSize: file.size,
      pageCount: pageResults[i].pageCount,
      pageCountStatus: pageResults[i].status,
    }))
  );

  res.status(201).json({
    order,
    files: orderFiles.map((f) => ({
      _id: f._id,
      originalFileName: f.originalFileName,
      fileSize: f.fileSize,
      pageCount: f.pageCount,
      pageCountStatus: f.pageCountStatus,
    })),
  });
});

export const listMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ studentId: req.user!._id }).sort({ createdAt: -1 });
  const orderIds = orders.map((o) => o._id);
  const files = await OrderFile.find({ orderId: { $in: orderIds } }).select('-storagePath');

  const filesByOrder = new Map<string, typeof files>();
  for (const f of files) {
    const key = f.orderId.toString();
    if (!filesByOrder.has(key)) filesByOrder.set(key, []);
    filesByOrder.get(key)!.push(f);
  }

  res.json({
    orders: orders.map((o) => ({ ...o.toObject(), files: filesByOrder.get(o._id.toString()) || [] })),
  });
});

export const getMyOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, studentId: req.user!._id });
  if (!order) throw new AppError('Order not found.', 404);
  const files = await OrderFile.find({ orderId: order._id }).select('-storagePath');
  res.json({ order, files });
});

export const cancelMyOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findOne({ _id: req.params.id, studentId: req.user!._id });
  if (!order) throw new AppError('Order not found.', 404);

  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new AppError('This order can no longer be cancelled.', 400);
  }

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  await order.save();

  res.json({ order });
});
