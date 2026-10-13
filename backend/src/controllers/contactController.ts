import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { createError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';
import type { AuthRequest } from '../middlewares/auth';

const contactSchema = z.object({
  customerId: z.string().min(1, 'Phải chọn khách hàng'),
  name: z.string().min(2, 'Tên liên hệ phải có ít nhất 2 ký tự').max(200),
  email: z.string().email('Email không hợp lệ').optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  position: z.string().max(200).optional().nullable(),
  department: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export async function getContacts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const search = req.query.search as string | undefined;
    const customerId = req.query.customerId as string | undefined;

    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, company: true, customerCode: true } },
          _count: { select: { interactions: true } },
        },
      }),
      prisma.contact.count({ where }),
    ]);

    res.json({
      success: true,
      data: contacts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getContact(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const contact = await prisma.contact.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, company: true, customerCode: true } },
        interactions: {
          orderBy: { interactionDate: 'desc' },
          take: 10,
          include: { user: { select: { name: true } } },
        },
      },
    });

    if (!contact) throw createError('Người liên hệ không tồn tại', 404);
    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
}

export async function createContact(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = contactSchema.safeParse(req.body);
    if (!result.success) throw createError(result.error.errors[0].message, 400);

    const customerExists = await prisma.customer.findUnique({ where: { id: result.data.customerId } });
    if (!customerExists) throw createError('Khách hàng không tồn tại', 404);

    const contact = await prisma.contact.create({
      data: result.data,
      include: { customer: { select: { id: true, name: true, company: true, customerCode: true } } },
    });

    logger.info({ contactId: contact.id, customerId: result.data.customerId }, 'Contact created');
    res.status(201).json({ success: true, message: 'Tạo người liên hệ thành công', data: contact });
  } catch (err) {
    next(err);
  }
}

export async function updateContact(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const result = contactSchema.partial().safeParse(req.body);
    if (!result.success) throw createError(result.error.errors[0].message, 400);

    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) throw createError('Người liên hệ không tồn tại', 404);

    const contact = await prisma.contact.update({
      where: { id },
      data: result.data,
      include: { customer: { select: { id: true, name: true, company: true, customerCode: true } } },
    });

    logger.info({ contactId: id }, 'Contact updated');
    res.json({ success: true, message: 'Cập nhật người liên hệ thành công', data: contact });
  } catch (err) {
    next(err);
  }
}

export async function deleteContact(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) throw createError('Người liên hệ không tồn tại', 404);

    await prisma.contact.delete({ where: { id } });
    logger.info({ contactId: id }, 'Contact deleted');
    res.json({ success: true, message: 'Xóa người liên hệ thành công' });
  } catch (err) {
    next(err);
  }
}
