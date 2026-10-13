import { Router } from 'express';
import { getInteractions, getInteraction, createInteraction, updateInteraction, deleteInteraction } from '../controllers/interactionController';
import { authenticate } from '../middlewares/auth';

const router = Router();
router.use(authenticate);

router.get('/', getInteractions);
router.get('/:id', getInteraction);
router.post('/', createInteraction);
router.put('/:id', updateInteraction);
router.delete('/:id', deleteInteraction);

export default router;
