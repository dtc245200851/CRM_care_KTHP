import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { CustomerStatus, CustomerSource } from '@prisma/client';
import { prisma } from '../config/database';
import { createError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';
import type { AuthRequest } from '../middlewares/auth';

const customerSchema = z.object({
  name: z.string().min(2, 'Tên khách hàng phải có ít nhất 2 ký tự').max(200),
  email: z.string().email('Email không hợp lệ').optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  status: z.nativeEnum(CustomerStatus).optional(),
  source: z.nativeEnum(CustomerSource).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

function generateCustomerCode(count: number): string {
  return `CUS${String(count + 1).padStart(3, '0')}`;
}

export async function getCustomers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const search = req.query.search as string | undefined;
    const status = req.query.status as CustomerStatus | undefined;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const allowedSortFields = ['name', 'company', 'status', 'createdAt', 'updatedAt', 'customerCode'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const where: Record<string, unknown> = {};
    if (status && Object.values(CustomerStatus).includes(status)) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { customerCode: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [safeSortBy]: sortOrder },
        include: {
          _count: { select: { contacts: true, interactions: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCustomer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        contacts: { orderBy: { createdAt: 'desc' } },
        interactions: {
          orderBy: { interactionDate: 'desc' },
          take: 20,
          include: { user: { select: { name: true, email: true } }, contact: { select: { name: true } } },
        },
        _count: { select: { contacts: true, interactions: true } },
      },
    });

    if (!customer) throw createError('Khách hàng không tồn tại', 404);

    res.json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
}

export async function createCustomer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = customerSchema.safeParse(req.body);
    if (!result.success) {
      throw createError(result.error.errors[0].message, 400);
    }

    const count = await prisma.customer.count();
    const customerCode = generateCustomerCode(count);

    const customer = await prisma.customer.create({
      data: { ...result.data, customerCode },
      include: { _count: { select: { contacts: true, interactions: true } } },
    });

    logger.info({ customerId: customer.id, customerCode }, 'Customer created');
    res.status(201).json({ success: true, message: 'Tạo khách hàng thành công', data: customer });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      next(createError('Email này đã được sử dụng', 409));
    } else {
      next(err);
    }
  }
}

export async function updateCustomer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const result = customerSchema.partial().safeParse(req.body);
    if (!result.success) {
      throw createError(result.error.errors[0].message, 400);
    }

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) throw createError('Khách hàng không tồn tại', 404);

    const customer = await prisma.customer.update({
      where: { id },
      data: result.data,
      include: { _count: { select: { contacts: true, interactions: true } } },
    });

    logger.info({ customerId: id }, 'Customer updated');
    res.json({ success: true, message: 'Cập nhật khách hàng thành công', data: customer });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      next(createError('Email này đã được sử dụng', 409));
    } else {
      next(err);
    }
  }
}

export async function deleteCustomer(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) throw createError('Khách hàng không tồn tại', 404);

    await prisma.customer.delete({ where: { id } });
    logger.info({ customerId: id }, 'Customer deleted');
    res.json({ success: true, message: 'Xóa khách hàng thành công' });
  } catch (err) {
    next(err);
  }
}
