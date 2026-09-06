import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { signToken } from '../middleware/auth';
import { env } from '../config/env';

const LOCK_THRESHOLD = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.').max(60),
  lastName: z.string().trim().min(1, 'Last name is required.').max(60),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
    .regex(/[0-9]/, 'Password must contain a number.'),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{8,20}$/, 'Please enter a valid phone number.'),
  roomNumber: z.string().trim().min(1, 'Room number is required.').max(20),
  residence: z.string().trim().max(100).optional(),
});

function setAuthCookie(res: Response, token: string) {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }
  const data = parsed.data;

  const existing = await User.findOne({ email: data.email });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    passwordHash,
    phone: data.phone,
    roomNumber: data.roomNumber,
    residence: data.residence,
    role: 'student',
  });

  const token = signToken(user._id.toString());
  setAuthCookie(res, token);

  res.status(201).json({ user });
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Please enter your email.'),
  password: z.string().min(1, 'Please enter your password.'),
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }
  const { email, password } = parsed.data;

  const user = await User.findOne({ email }).select('+passwordHash');
  const genericError = new AppError('Incorrect email or password.', 401);

  if (!user) throw genericError;

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new AppError(
      `Too many failed attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      423
    );
  }

  if (!user.isActive) {
    throw new AppError('This account has been disabled. Please contact the residence.', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= LOCK_THRESHOLD) {
      user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    throw genericError;
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  await user.save();

  const token = signToken(user._id.toString());
  setAuthCookie(res, token);

  res.json({ user });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(env.cookieName, { path: '/' });
  res.json({ message: 'Logged out.' });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ user: req.user });
});

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(60).optional(),
  lastName: z.string().trim().min(1).max(60).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{8,20}$/)
    .optional(),
  roomNumber: z.string().trim().min(1).max(20).optional(),
  residence: z.string().trim().max(100).optional(),
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError('Please check the information you entered.', 400);
  }
  const user = await User.findByIdAndUpdate(req.user!._id, parsed.data, {
    new: true,
    runValidators: true,
  });
  res.json({ user });
});
