import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Log slow queries
(prisma as any).$on('query', (e: any) => {
  if (e.duration > 500) {
    logger.warn({ query: e.query, duration: e.duration }, 'Slow query detected');
  }
});

(prisma as any).$on('error', (e: any) => {
  logger.error({ message: e.message, target: e.target }, 'Prisma error');
});

export default prisma;
