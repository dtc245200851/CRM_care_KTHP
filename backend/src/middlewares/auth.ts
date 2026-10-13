import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.', 401);
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET is not configured');
      throw createError('Lỗi cấu hình máy chủ', 500);
    }

    const payload = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: string;
      name: string;
    };

    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(createError('Token không hợp lệ hoặc đã hết hạn', 401));
    } else {
      next(err);
    }
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createError('Chưa xác thực', 401));
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(createError('Bạn không có quyền thực hiện thao tác này', 403));
    }
    next();
  };
}
