import { Router } from 'express';
import { healthCheck, readinessCheck } from '../controllers/healthController';

const router = Router();
router.get('/', healthCheck);
router.get('/ready', readinessCheck);

export default router;
