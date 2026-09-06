import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

interface JwtPayload {
  userId: string;
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

// Reads the JWT from the httpOnly cookie (or an Authorization header as a
// fallback for API clients), verifies it, loads the user, and rejects
// disabled accounts. Every protected route depends on this running first.
export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const cookieToken = req.cookies?.[env.cookieName];
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  const token = cookieToken || headerToken;

  if (!token) {
    throw new AppError('Please log in to continue.', 401);
  }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
  } catch {
    throw new AppError('Your session has expired. Please log in again.', 401);
  }

  const user = await User.findById(payload.userId);
  if (!user || !user.isActive) {
    throw new AppError('This account is no longer available.', 401);
  }

  req.user = user;
  next();
});

export function requireRole(...roles: Array<'student' | 'admin'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to do that.', 403);
    }
    next();
  };
}
