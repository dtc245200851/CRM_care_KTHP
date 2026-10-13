import type { Response, NextFunction } from 'express';
import { z } from 'zod';
import { InteractionType, InteractionStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { createError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';
import type { AuthRequest } from '../middlewares/auth';

const interactionSchema = z.object({
  customerId: z.string().min(1, 'Phải chọn khách hàng'),
  contactId: z.string().optional().nullable(),
  interactionType: z.nativeEnum(InteractionType),
  title: z.string().min(2, 'Tiêu đề phải có ít nhất 2 ký tự').max(500),
  content: z.string().max(5000).optional().nullable(),
  interactionDate: z.string().datetime().or(z.string().refine(v => !isNaN(Date.parse(v)), 'Ngày không hợp lệ')),
  status: z.nativeEnum(InteractionStatus).optional(),
});

export async function getInteractions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const customerId = req.query.customerId as string | undefined;
    const contactId = req.query.contactId as string | undefined;
    const interactionType = req.query.interactionType as InteractionType | undefined;
    const status = req.query.status as InteractionStatus | undefined;
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId;
    if (contactId) where.contactId = contactId;
    if (interactionType && Object.values(InteractionType).includes(interactionType)) {
      where.interactionType = interactionType;
    }
    if (status && Object.values(InteractionStatus).includes(status)) {
      where.status = status;
    }

    const [interactions, total] = await Promise.all([
      prisma.interaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { interactionDate: sortOrder },
        include: {
          customer: { select: { id: true, name: true, company: true, customerCode: true } },
          contact: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.interaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: interactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getInteraction(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const interaction = await prisma.interaction.findUnique({
      where: { id },
      include: {
        customer: true,
        contact: true,
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!interaction) throw createError('Tương tác không tồn tại', 404);
    res.json({ success: true, data: interaction });
  } catch (err) {
    next(err);
  }
}

export async function createInteraction(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw createError('Chưa xác thực', 401);

    const result = interactionSchema.safeParse(req.body);
    if (!result.success) throw createError(result.error.errors[0].message, 400);

    const customerExists = await prisma.customer.findUnique({ where: { id: result.data.customerId } });
    if (!customerExists) throw createError('Khách hàng không tồn tại', 404);

    const interaction = await prisma.interaction.create({
      data: {
        ...result.data,
        interactionDate: new Date(result.data.interactionDate),
        userId: req.user.id,
      },
      include: {
        customer: { select: { id: true, name: true, company: true, customerCode: true } },
        contact: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info({ interactionId: interaction.id, customerId: result.data.customerId, type: result.data.interactionType }, 'Interaction created');
    res.status(201).json({ success: true, message: 'Tạo tương tác thành công', data: interaction });
  } catch (err) {
    next(err);
  }
}

export async function updateInteraction(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const result = interactionSchema.partial().safeParse(req.body);
    if (!result.success) throw createError(result.error.errors[0].message, 400);

    const existing = await prisma.interaction.findUnique({ where: { id } });
    if (!existing) throw createError('Tương tác không tồn tại', 404);

    const updateData: Record<string, unknown> = { ...result.data };
    if (result.data.interactionDate) {
      updateData.interactionDate = new Date(result.data.interactionDate);
    }

    const interaction = await prisma.interaction.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true, company: true, customerCode: true } },
        contact: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    logger.info({ interactionId: id }, 'Interaction updated');
    res.json({ success: true, message: 'Cập nhật tương tác thành công', data: interaction });
  } catch (err) {
    next(err);
  }
}

export async function deleteInteraction(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const existing = await prisma.interaction.findUnique({ where: { id } });
    if (!existing) throw createError('Tương tác không tồn tại', 404);

    await prisma.interaction.delete({ where: { id } });
    logger.info({ interactionId: id }, 'Interaction deleted');
    res.json({ success: true, message: 'Xóa tương tác thành công' });
  } catch (err) {
    next(err);
  }
}
