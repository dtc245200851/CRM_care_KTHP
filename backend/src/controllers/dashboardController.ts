import type { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import type { AuthRequest } from '../middlewares/auth';

export async function getDashboardStats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalCustomers,
      totalContacts,
      totalInteractions,
      newCustomers30d,
      newCustomers7d,
      customersByStatus,
      recentInteractions,
      recentCustomers,
      interactionsByType,
      interactionsByDay,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.contact.count(),
      prisma.interaction.count(),
      prisma.customer.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.customer.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.customer.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.interaction.findMany({
        take: 10,
        orderBy: { interactionDate: 'desc' },
        include: {
          customer: { select: { id: true, name: true, company: true } },
          user: { select: { name: true } },
        },
      }),
      prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, company: true, status: true, email: true, createdAt: true, customerCode: true,
          _count: { select: { contacts: true, interactions: true } },
        },
      }),
      prisma.interaction.groupBy({
        by: ['interactionType'],
        _count: { id: true },
      }),
      // Interactions in the past 30 days grouped by date
      prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE(interaction_date)::text as date, COUNT(*)::bigint as count
        FROM interactions
        WHERE interaction_date >= ${thirtyDaysAgo}
        GROUP BY DATE(interaction_date)
        ORDER BY date ASC
        LIMIT 30
      `,
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalCustomers,
          totalContacts,
          totalInteractions,
          newCustomers30d,
          newCustomers7d,
        },
        customersByStatus: customersByStatus.map(s => ({ status: s.status, count: s._count.id })),
        interactionsByType: interactionsByType.map(t => ({ type: t.interactionType, count: t._count.id })),
        interactionsByDay: interactionsByDay.map(d => ({ date: d.date, count: Number(d.count) })),
        recentInteractions,
        recentCustomers,
      },
    });
  } catch (err) {
    next(err);
  }
}
