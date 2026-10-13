import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export async function healthCheck(_req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'crm-care-backend',
    version: '1.0.0',
  });
}

export async function readinessCheck(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      status: 'ready',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (err) {
    logger.error({ err }, 'Readiness check failed - database unreachable');
    res.status(503).json({
      success: false,
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
}
