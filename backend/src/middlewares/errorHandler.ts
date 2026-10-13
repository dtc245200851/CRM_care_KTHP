import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational ?? false;

  // Log error details server-side
  if (statusCode >= 500) {
    logger.error({
      err: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
      req: {
        method: req.method,
        url: req.url,
        ip: req.ip,
      },
    }, 'Unhandled server error');
  } else {
    logger.warn({
      err: { message: err.message, name: err.name },
      req: { method: req.method, url: req.url },
    }, 'Client error');
  }

  // Never expose stack trace or sensitive info to clients
  const message = isOperational
    ? err.message
    : statusCode >= 500
      ? 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.'
      : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && {
      debug: err.message,
    }),
  });
}

export function createError(message: string, statusCode: number): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}
