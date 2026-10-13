import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/database';
import { createError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';
import type { AuthRequest } from '../middlewares/auth';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      throw createError(result.error.errors[0].message, 400);
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn({ email }, 'Login attempt with unknown email');
      throw createError('Email hoặc mật khẩu không đúng', 401);
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      logger.warn({ email }, 'Login attempt with wrong password');
      throw createError('Email hoặc mật khẩu không đúng', 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw createError('Lỗi cấu hình máy chủ', 500);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'] }
    );

    logger.info({ userId: user.id, email: user.email }, 'User logged in successfully');

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw createError('Chưa xác thực', 401);

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    if (!user) throw createError('Người dùng không tồn tại', 404);

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // JWT is stateless; client should discard token
  res.json({ success: true, message: 'Đăng xuất thành công' });
}
