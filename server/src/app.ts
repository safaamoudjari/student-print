import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { sanitizeRequest } from './middleware/sanitize';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/authRoutes';
import orderRoutes from './routes/orderRoutes';
import fileRoutes from './routes/fileRoutes';
import adminRoutes from './routes/adminRoutes';
import publicRoutes from './routes/publicRoutes';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  app.use(sanitizeRequest);
  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  }
  app.use('/api', apiLimiter);

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/files', fileRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', publicRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
