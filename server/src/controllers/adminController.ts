import { Request, Response } from 'express';
import { z } from 'zod';
import { Order, OrderStatus } from '../models/Order';
import { OrderFile } from '../models/OrderFile';
import { User } from '../models/User';
import { Service } from '../models/Service';
import { Settings, getSettings } from '../models/Settings';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

const STATUS_TIMESTAMP_FIELD: Partial<Record<OrderStatus, string>> = {
  confirmed: 'confirmedAt',
  processing: 'processingAt',
  ready: 'readyAt',
  completed: 'completedAt',
  cancelled: 'cancelledAt',
};

// ---------- Orders ----------

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, search, from, to, sort } = req.query as Record<string, string | undefined>;

  const filter: Record<string, any> = {};
  if (status && status !== 'all') filter.status = status;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  let studentIds: string[] | undefined;
  if (search) {
    const matchingUsers = await User.find({
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } },
      ],
    }).select('_id');
    studentIds = matchingUsers.map((u) => u._id.toString());
    filter.$or = [{ orderNumber: { $regex: search, $options: 'i' } }, { studentId: { $in: studentIds } }];
  }

  const sortMap: Record<string, any> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    highest: { totalPrice: -1 },
    lowest: { totalPrice: 1 },
  };

  const orders = await Order.find(filter)
    .sort(sortMap[sort || 'newest'] || sortMap.newest)
    .populate('studentId', 'firstName lastName phone roomNumber email')
    .limit(200);

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

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate(
    'studentId',
    'firstName lastName phone roomNumber email residence'
  );
  if (!order) throw new AppError('Order not found.', 404);
  const files = await OrderFile.find({ orderId: order._id }).select('-storagePath');
  res.json({ order, files });
});

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['ready', 'cancelled'],
  ready: ['completed'],
  completed: [],
  cancelled: [],
};

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const schema = z.object({
    status: z.enum(['pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled']),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new AppError('Invalid status.', 400);

  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found.', 404);

  const nextStatus = parsed.data.status;
  if (!ALLOWED_TRANSITIONS[order.status].includes(nextStatus) && order.status !== nextStatus) {
    throw new AppError(`Cannot change status from "${order.status}" to "${nextStatus}".`, 400);
  }

  order.status = nextStatus;
  const field = STATUS_TIMESTAMP_FIELD[nextStatus];
  if (field) (order as any)[field] = new Date();
  await order.save();

  res.json({ order });
});

export const deleteOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found.', 404);
  order.status = 'cancelled';
  order.cancelledAt = new Date();
  await order.save();
  res.json({ order });
});

// ---------- Statistics ----------

export const getStatistics = asyncHandler(async (req: Request, res: Response) => {
  const { from, to } = req.query as Record<string, string | undefined>;
  const dateFilter: Record<string, any> = {};
  if (from || to) {
    dateFilter.createdAt = {};
    if (from) dateFilter.createdAt.$gte = new Date(from);
    if (to) dateFilter.createdAt.$lte = new Date(to);
  }

  const [total, pending, confirmed, processing, ready, completed, cancelled, revenueAgg] =
    await Promise.all([
      Order.countDocuments(dateFilter),
      Order.countDocuments({ ...dateFilter, status: 'pending' }),
      Order.countDocuments({ ...dateFilter, status: 'confirmed' }),
      Order.countDocuments({ ...dateFilter, status: 'processing' }),
      Order.countDocuments({ ...dateFilter, status: 'ready' }),
      Order.countDocuments({ ...dateFilter, status: 'completed' }),
      Order.countDocuments({ ...dateFilter, status: 'cancelled' }),
      Order.aggregate([
        { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
    ]);

  res.json({
    total,
    pending,
    confirmed,
    processing,
    ready,
    completed,
    cancelled,
    totalRevenue: revenueAgg[0]?.total || 0,
  });
});

// ---------- Users ----------

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query as Record<string, string | undefined>;
  const filter: Record<string, any> = { role: 'student' };
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { roomNumber: { $regex: search, $options: 'i' } },
    ];
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  const orderCounts = await Order.aggregate([
    { $group: { _id: '$studentId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(orderCounts.map((c) => [c._id.toString(), c.count]));

  res.json({
    users: users.map((u) => ({ ...u.toJSON(), orderCount: countMap.get(u._id.toString()) || 0 })),
  });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  const orders = await Order.find({ studentId: user._id }).sort({ createdAt: -1 });
  res.json({ user, orders });
});

export const setUserActive = asyncHandler(async (req: Request, res: Response) => {
  const schema = z.object({ isActive: z.boolean() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) throw new AppError('Invalid request.', 400);

  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  if (user.role === 'admin') throw new AppError('Admin accounts cannot be disabled here.', 400);

  user.isActive = parsed.data.isActive;
  await user.save();
  res.json({ user });
});

// ---------- Services ----------

export const listServices = asyncHandler(async (_req: Request, res: Response) => {
  const services = await Service.find().sort({ createdAt: 1 });
  res.json({ services });
});

const serviceSchema = z.object({
  name: z.string().trim().min(1).max(60),
  type: z.enum(['per_page_bw', 'per_page_color', 'flat', 'per_unit']),
  price: z.coerce.number().min(0),
  unit: z.string().trim().max(20).optional(),
  isActive: z.boolean().optional(),
});

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const parsed = serviceSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError('Please check the service details.', 400);
  const service = await Service.create(parsed.data);
  res.status(201).json({ service });
});

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const parsed = serviceSchema.partial().safeParse(req.body);
  if (!parsed.success) throw new AppError('Please check the service details.', 400);
  const service = await Service.findByIdAndUpdate(req.params.id, parsed.data, {
    new: true,
    runValidators: true,
  });
  if (!service) throw new AppError('Service not found.', 404);
  res.json({ service });
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  const service = await Service.findById(req.params.id);
  if (!service) throw new AppError('Service not found.', 404);
  if (service.isCore) throw new AppError('Core printing services cannot be deleted, only deactivated.', 400);
  await service.deleteOne();
  res.json({ message: 'Service deleted.' });
});

// ---------- Settings ----------

export const getAdminSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await getSettings();
  res.json({ settings });
});

const settingsSchema = z.object({
  maxFileSizeMb: z.coerce.number().min(1).max(200).optional(),
  maxFilesPerOrder: z.coerce.number().min(1).max(50).optional(),
  maxCopies: z.coerce.number().min(1).max(200).optional(),
  fileRetentionDays: z.coerce.number().min(0).max(365).optional(),
  residenceName: z.string().trim().max(100).optional(),
});

export const updateAdminSettings = asyncHandler(async (req: Request, res: Response) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError('Please check the settings values.', 400);

  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();
  Object.assign(settings, parsed.data);
  await settings.save();

  res.json({ settings });
});
