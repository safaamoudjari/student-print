import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: 'This page could not be found.' });
}

// Centralized error handler. Never leaks stack traces to the client;
// translates known error types (Mongo duplicate key, Mongoose validation,
// Multer upload errors, JSON parse errors) into friendly messages.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  let statusCode = 500;
  let message = 'Something went wrong. Please try again.';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = `The file is too large. Maximum allowed size is ${env.maxFileSizeMb} MB.`;
    } else if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Too many files were uploaded for this order.';
    } else {
      message = 'There was a problem uploading your file. Please try again.';
    }
  } else if (err.message === 'UNSUPPORTED_FILE_TYPE') {
    statusCode = 400;
    message = 'This file type is not supported. Please upload PDF, DOC, DOCX, JPG or PNG.';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((e: any) => e.message)
      .join(' ') || 'Please check the information you entered.';
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || { field: 1 })[0];
    message = `This ${field} is already in use.`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'That item could not be found.';
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'We could not read your request. Please try again.';
  }

  if (env.nodeEnv !== 'test') {
    // eslint-disable-next-line no-console
    console.error(`[error] ${req.method} ${req.originalUrl} ->`, err.message);
  }

  res.status(statusCode).json({ message });
}
