import { Router } from 'express';
import { fareController } from '../controllers/fare.controller';

const router = Router();

router.get('/settings', fareController.getSettings);
router.get('/estimate', fareController.estimateFare);

export default router;
